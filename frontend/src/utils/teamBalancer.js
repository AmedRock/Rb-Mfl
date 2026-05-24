/**
 * Gelişmiş Takım Dengeleme Algoritması
 *
 * İyileştirmeler:
 * 1. Pozisyona göre ağırlıklı stat skoru (6 stat × rol ağırlığı)
 * 2. Uyumlu mevki takası matrisi (DEF↔MID gibi takaslar mümkün)
 * 3. Simulated Annealing — local optimumdan kaçış
 * 4. Snake Draft autoFill — baştan dengeli dağıtım
 */

import { TAG_MAP } from './formations';

// ─────────────────────────────────────────────────────────────────────────────
// 1. POZİSYONA GÖRE AĞIRLIKLI SKOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Her rol için stat ağırlıkları (toplamları 1.0)
 * GK: defans & fizik ağır basar
 * DEF: defans, fizik, hız
 * MID: pas, dribling, hız dengeli
 * FWD: şut ve hız öne çıkar
 */
const ROLE_WEIGHTS = {
  GK:  { defending: 0.45, physical: 0.30, pace: 0.15, passing: 0.10, shooting: 0.00, dribbling: 0.00 },
  DEF: { defending: 0.40, physical: 0.25, pace: 0.20, passing: 0.15, shooting: 0.00, dribbling: 0.00 },
  MID: { passing: 0.35,  dribbling: 0.25, pace: 0.20, shooting: 0.20, defending: 0.00, physical: 0.00 },
  FWD: { shooting: 0.40,  pace: 0.30,     dribbling: 0.20, physical: 0.10, passing: 0.00, defending: 0.00 },
};

/**
 * Bir oyuncunun belirli bir role göre denge skorunu hesaplar (0–100 arası)
 * %70 pozisyon ağırlıklı stat, %30 genel OVR
 */
export function playerScore(player, role = 'MID') {
  const weights = ROLE_WEIGHTS[role] || ROLE_WEIGHTS.MID;
  const stats   = player.stats || {};

  const statScore = Object.entries(weights).reduce(
    (sum, [stat, w]) => sum + (stats[stat] || 50) * w,
    0
  );

  const ovrScore = (player.overall || 50) / 99 * 100;

  return Math.round((statScore * 0.70 + ovrScore * 0.30) * 10) / 10;
}

/**
 * Bir takımın toplam denge skorunu hesaplar.
 * assignments: { slotId → player }, slots: slot dizisi (rol bilgisi için)
 */
export function teamTotalScore(players, slots = []) {
  if (!players || players.length === 0) return 0;

  return players.reduce((sum, p) => {
    if (!p) return sum;
    // Oyuncunun hangi slotta oturduğunu bul → rol bilgisi al
    const slot = slots.find(s => s.playerId === p._id);
    const role = slot?.role || 'MID';
    return sum + playerScore(p, role);
  }, 0);
}

/**
 * Assignments map'inden oyuncu listesi ve slot-oyuncu eşlemesi döner
 */
function assignmentsToEntries(assignments) {
  return Object.entries(assignments).filter(([, p]) => p);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. UYUMLU MEVKİ TAKASI MATRİSİ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hangi roller birbiriyle takas edilebilir
 * GK benzersizdir. DEF↔MID CDM-CB için, MID↔FWD CAM-ST için mantıklı.
 */
const COMPATIBLE_ROLES = {
  GK:  new Set(['GK']),
  DEF: new Set(['DEF', 'MID']),
  MID: new Set(['MID', 'DEF', 'FWD']),
  FWD: new Set(['FWD', 'MID']),
};

function rolesCompatible(roleA, roleB) {
  return COMPATIBLE_ROLES[roleA]?.has(roleB) ?? false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SİMULATED ANNEALING — TAKIM DENGELEMESİ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simulated Annealing ile iki takımı dengeler.
 *
 * Greedy yerine SA kullandığımızda:
 * - Başta "kötü" takaslara sıcaklığa bağlı olasılıkla izin verilir
 * - Bu sayede local optimumdan çıkılabilir
 * - Sıcaklık azaldıkça yalnızca iyileştirici takaslar kabul edilir
 */
export function balanceTeams(teamASlots, teamBSlots, teamAAssignments, teamBAssignments) {
  const newA = { ...teamAAssignments };
  const newB = { ...teamBAssignments };

  const filledA = assignmentsToEntries(newA);
  const filledB = assignmentsToEntries(newB);

  if (filledA.length === 0 || filledB.length === 0) return { teamA: newA, teamB: newB };

  // Slot rol haritaları
  const roleMapA = Object.fromEntries(teamASlots.map(s => [s.id, s.role]));
  const roleMapB = Object.fromEntries(teamBSlots.map(s => [s.id, s.role]));

  // Skor hesaplama yardımcısı (rol bazlı)
  const scorePlayer = (player, slotId, isTeamA) => {
    const role = isTeamA ? roleMapA[slotId] : roleMapB[slotId];
    return playerScore(player, role || 'MID');
  };

  const totalScore = () => {
    const sA = filledA.reduce((s, [id, p]) => s + (newA[id] ? scorePlayer(newA[id], id, true) : 0), 0);
    const sB = filledB.reduce((s, [id, p]) => s + (newB[id] ? scorePlayer(newB[id], id, false) : 0), 0);
    return { sA, sB, diff: Math.abs(sA - sB) };
  };

  // ── SA parametreleri ──
  let T       = 100;          // başlangıç sıcaklığı
  const alpha  = 0.94;        // soğuma katsayısı
  const minT   = 0.5;         // dur sıcaklığı
  const targetDiff = 1.0;     // yeterli denge eşiği

  // Geçerli takas çiftlerini bir kez hesapla (performans)
  const swapCandidates = [];
  for (const [idA] of filledA) {
    const roleA = roleMapA[idA];
    for (const [idB] of filledB) {
      const roleB = roleMapB[idB];
      if (rolesCompatible(roleA, roleB)) {
        swapCandidates.push([idA, idB]);
      }
    }
  }

  if (swapCandidates.length === 0) return { teamA: newA, teamB: newB };

  while (T > minT) {
    const { diff } = totalScore();
    if (diff < targetDiff) break;

    // Rastgele bir takas adayı seç
    const [idA, idB] = swapCandidates[Math.floor(Math.random() * swapCandidates.length)];
    const pA = newA[idA];
    const pB = newB[idB];
    if (!pA || !pB) { T *= alpha; continue; }

    // Takas öncesi fark
    const before = totalScore().diff;

    // Geçici takas
    newA[idA] = pB;
    newB[idB] = pA;

    const after = totalScore().diff;
    const delta = after - before; // pozitifse kötüleşti

    // Kabul koşulu: iyileşiyorsa her zaman, kötüleşiyorsa e^(-delta/T) olasılıkla
    if (delta < 0 || Math.random() < Math.exp(-delta / T)) {
      // Kabul et — newA/newB zaten güncellendi
    } else {
      // Geri al
      newA[idA] = pA;
      newB[idB] = pB;
    }

    T *= alpha;
  }

  return { teamA: newA, teamB: newB };
}

// ─────────────────────────────────────────────────────────────────────────────
// MEVKI UYUM KONTROLÜ (autoFill için)
// ─────────────────────────────────────────────────────────────────────────────

export function checkTagMatch(player, role) {
  const matchingTags = TAG_MAP[role] || [];
  const playerTags   = player.tags || [];

  if (playerTags.some(tag => matchingTags.includes(tag))) return 'perfect';
  if (role === 'GK'  && player.position === 'GK') return 'perfect';
  if (role === 'DEF' && ['CB', 'LB', 'RB', 'CDM'].includes(player.position)) return 'partial';
  if (role === 'MID' && ['CM', 'CAM', 'CDM', 'LM', 'RM'].includes(player.position)) return 'partial';
  if (role === 'FWD' && ['ST', 'CF', 'LW', 'RW', 'LM', 'RM'].includes(player.position)) return 'partial';

  return 'none';
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SNAKE DRAFT — DENGELİ OTOMATİK DOLDURMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * İki takımı Snake Draft yöntemiyle eş zamanlı doldurur.
 *
 * Yöntem:
 * Round 1 (→): Güçlü → A, İkinci güçlü → B
 * Round 2 (←): Üçüncü güçlü → B, Dördüncü → A   (yön tersine döner)
 * Round 3 (→): ...
 *
 * Baştan dengeli dağılım sağlar; ardından balanceTeams fine-tuning yapar.
 */
export function autoFillSlots(slotsA, slotsB, allPlayers, currentA = {}, currentB = {}) {
  // ── Zaten dolu slotları ve kullanılan oyuncuları belirle ──
  const usedIds = new Set([
    ...Object.values(currentA).filter(Boolean).map(p => p._id),
    ...Object.values(currentB).filter(Boolean).map(p => p._id),
  ]);

  const newA = { ...currentA };
  const newB = { ...currentB };

  // Boş slotları bul
  const emptyA = slotsA.filter(s => !newA[s.id]);
  const emptyB = slotsB.filter(s => !newB[s.id]);

  // Tüm boş slotları birleştir ve dönüşümlü liste oluştur (A-B-B-A-A-B...)
  // Snake draft: her round yön değiştirir
  const queue = buildSnakeQueue(emptyA, emptyB);

  // Mevcut oyuncuları genel skora göre sırala (desc)
  const available = allPlayers
    .filter(p => !usedIds.has(p._id))
    .slice() // orijinali değiştirme
    .sort((a, b) => playerScore(b, 'MID') - playerScore(a, 'MID'));

  for (const { slot, team } of queue) {
    if (available.length === 0) break;

    // Bu slot'a uygun, henüz kullanılmamış en iyi oyuncuyu bul
    const candidates = available
      .filter(p => !usedIds.has(p._id))
      .map(p => ({
        player: p,
        match:  checkTagMatch(p, slot.role),
        score:  playerScore(p, slot.role),
      }));

    candidates.sort((a, b) => {
      const order = { perfect: 0, partial: 1, none: 2 };
      if (order[a.match] !== order[b.match]) return order[a.match] - order[b.match];
      return b.score - a.score;
    });

    const best = candidates[0];
    if (!best) continue;

    if (team === 'A') {
      newA[slot.id] = best.player;
    } else {
      newB[slot.id] = best.player;
    }
    usedIds.add(best.player._id);

    // Listeyi güncelle (kullanılanı çıkar)
    const idx = available.findIndex(p => p._id === best.player._id);
    if (idx !== -1) available.splice(idx, 1);
  }

  return { teamA: newA, teamB: newB };
}

/**
 * Snake draft sıralaması oluşturur.
 * Dönüş: [{ slot, team }, ...]
 *
 * Örnek (3 slot her takım):
 * A0, B0, B1, A1, A2, B2
 */
function buildSnakeQueue(slotsA, slotsB) {
  const queue  = [];
  const maxLen = Math.max(slotsA.length, slotsB.length);
  let forward  = true; // true → A önce, false → B önce

  for (let i = 0; i < maxLen; i++) {
    if (forward) {
      if (i < slotsA.length) queue.push({ slot: slotsA[i], team: 'A' });
      if (i < slotsB.length) queue.push({ slot: slotsB[i], team: 'B' });
    } else {
      if (i < slotsB.length) queue.push({ slot: slotsB[i], team: 'B' });
      if (i < slotsA.length) queue.push({ slot: slotsA[i], team: 'A' });
    }
    forward = !forward;
  }

  return queue;
}
