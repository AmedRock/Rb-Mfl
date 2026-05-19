/**
 * Takım Dengeleme Algoritması
 * 
 * Denge Skoru = (marketValue / 200) * 40 + (overall / 99) * 60
 * Piyasa değeri %40, OVR %60 ağırlıklı.
 */

import { TAG_MAP } from './formations';

/**
 * Tek oyuncunun denge skorunu hesaplar (0-100 arası)
 */
export function playerScore(player) {
  const mv = (player.marketValue || 50) / 200 * 40;
  const ovr = (player.overall || 50) / 99 * 60;
  return Math.round((mv + ovr) * 10) / 10;
}

/**
 * Bir takımın toplam denge skorunu hesaplar
 */
export function teamTotalScore(players) {
  return players.reduce((sum, p) => sum + (p ? playerScore(p) : 0), 0);
}

/**
 * Bir oyuncunun belirli bir mevkiye uyumunu kontrol eder
 * @returns {'perfect' | 'partial' | 'none'}
 */
export function checkTagMatch(player, role) {
  const matchingTags = TAG_MAP[role] || [];
  const playerTags = player.tags || [];
  
  // Tam uyum: oyuncunun tag'lerinden biri mevkiyle eşleşiyor
  const hasPerfectMatch = playerTags.some(tag => matchingTags.includes(tag));
  if (hasPerfectMatch) return 'perfect';
  
  // Kısmi uyum: oyuncunun ana pozisyonu yakın
  // GK pozisyonundaki oyuncu sadece GK slotuna uyar
  if (role === 'GK' && player.position === 'GK') return 'perfect';
  if (role === 'DEF' && ['CB', 'LB', 'RB', 'CDM'].includes(player.position)) return 'partial';
  if (role === 'MID' && ['CM', 'CAM', 'CDM', 'LM', 'RM'].includes(player.position)) return 'partial';
  if (role === 'FWD' && ['ST', 'CF', 'LW', 'RW', 'LM', 'RM'].includes(player.position)) return 'partial';
  
  return 'none';
}

/**
 * Boş slotları otomatik doldurur
 * Öncelik: tag uyumu > OVR > piyasa değeri
 */
export function autoFillSlots(slots, allPlayers, currentAssignments) {
  const usedIds = new Set(
    Object.values(currentAssignments).filter(Boolean).map(p => p._id)
  );
  const availablePlayers = allPlayers.filter(p => !usedIds.has(p._id));
  
  const newAssignments = { ...currentAssignments };
  
  // Boş slotları bul
  const emptySlotIds = slots
    .filter(slot => !newAssignments[slot.id])
    .map(slot => slot.id);

  // Her boş slot için en uygun oyuncuyu bul
  for (const slotId of emptySlotIds) {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) continue;

    const remaining = availablePlayers.filter(p => !usedIds.has(p._id));
    if (remaining.length === 0) break;

    // Oyuncuları uyuma göre sırala
    const scored = remaining.map(p => ({
      player: p,
      match: checkTagMatch(p, slot.role),
      score: playerScore(p)
    }));

    // Sıralama: perfect > partial > none, sonra skor
    scored.sort((a, b) => {
      const matchOrder = { perfect: 0, partial: 1, none: 2 };
      if (matchOrder[a.match] !== matchOrder[b.match]) {
        return matchOrder[a.match] - matchOrder[b.match];
      }
      return b.score - a.score;
    });

    if (scored.length > 0) {
      newAssignments[slotId] = scored[0].player;
      usedIds.add(scored[0].player._id);
    }
  }

  return newAssignments;
}

/**
 * İki takımı dengeler: Toplam denge skorlarını eşitlemek için
 * oyuncuları takımlar arasında takas eder.
 * 
 * Greedy swap: En büyük farkı kapatan takası yaparak iterasyon.
 */
export function balanceTeams(teamASlots, teamBSlots, teamAAssignments, teamBAssignments) {
  const newA = { ...teamAAssignments };
  const newB = { ...teamBAssignments };

  // Sadece dolu slotları al
  const filledA = Object.entries(newA).filter(([, p]) => p);
  const filledB = Object.entries(newB).filter(([, p]) => p);

  let improved = true;
  let iterations = 0;
  const maxIterations = 50; // Sonsuz döngü önlemi

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    const scoreA = teamTotalScore(Object.values(newA).filter(Boolean));
    const scoreB = teamTotalScore(Object.values(newB).filter(Boolean));
    const currentDiff = Math.abs(scoreA - scoreB);

    if (currentDiff < 1) break; // Yeterince dengeli

    let bestSwap = null;
    let bestNewDiff = currentDiff;

    // Aynı role'deki oyuncuları takas etmeyi dene
    for (const [slotIdA, playerA] of filledA) {
      if (!playerA) continue;
      const slotA = teamASlots.find(s => s.id === slotIdA);
      
      for (const [slotIdB, playerB] of filledB) {
        if (!playerB) continue;
        const slotB = teamBSlots.find(s => s.id === slotIdB);

        // Aynı mevkideki oyuncuları takas et (etiket uyumunu bozmamak için)
        if (slotA?.role !== slotB?.role) continue;

        // Takas sonrası skoru hesapla
        const newScoreA = scoreA - playerScore(playerA) + playerScore(playerB);
        const newScoreB = scoreB - playerScore(playerB) + playerScore(playerA);
        const newDiff = Math.abs(newScoreA - newScoreB);

        if (newDiff < bestNewDiff) {
          bestNewDiff = newDiff;
          bestSwap = { slotIdA, slotIdB };
        }
      }
    }

    if (bestSwap && bestNewDiff < currentDiff - 0.5) {
      // Takası uygula
      const tempA = newA[bestSwap.slotIdA];
      newA[bestSwap.slotIdA] = newB[bestSwap.slotIdB];
      newB[bestSwap.slotIdB] = tempA;
      improved = true;
    }
  }

  return { teamA: newA, teamB: newB };
}
