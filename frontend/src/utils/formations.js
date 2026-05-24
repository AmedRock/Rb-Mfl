/**
 * Formasyon Konfigürasyonu
 *
 * Her formasyon, slot pozisyonlarını yüzde (%) cinsinden tanımlar.
 * Saha sol yarısı (Takım A): x=0-50%, sağ yarısı (Takım B): x=50-100%
 *
 * Her slot: { x, y, role, subRole, id }
 *   - role:    "GK" | "DEF" | "MID" | "FWD"
 *   - subRole: "GK" | "LB" | "CB" | "RB" | "CDM" | "CM" | "CAM" | "LM" | "RM" | "LW" | "ST" | "RW"
 *   - x, y:   Takım A için yüzde pozisyon
 */

// Etiket-Mevki eşleşme tablosu
export const TAG_MAP = {
  GK:  ['Kaleci'],
  DEF: ['Defans', 'Stoper'],
  MID: ['Orta Saha', 'Box-to-box'],
  FWD: ['Forvet', 'Kanat', 'Hızlı', 'Yaratıcı', 'Target Man', 'Dribling'],
};

// Mevki Türkçe isimleri
export const ROLE_LABELS = {
  GK:  'Kaleci',
  DEF: 'Defans',
  MID: 'Orta Saha',
  FWD: 'Forvet',
};

// Detaylı pozisyon Türkçe isimleri
export const POSITION_LABELS = {
  GK:  'Kaleci',
  CB:  'Stoper',
  LB:  'Sol Bek',
  RB:  'Sağ Bek',
  CDM: 'Defansif Orta',
  CM:  'Orta Saha',
  CAM: 'Ofansif Orta',
  LM:  'Sol Orta',
  RM:  'Sağ Orta',
  LW:  'Sol Kanat',
  RW:  'Sağ Kanat',
  ST:  'Santrafor',
  CF:  'Klasik Forvet',
};

// ── SubRole haritaları ──────────────────────────────────────────────────────
// Kaç oyuncu var → her oyuncunun ideal sub-role'u (soldan sağa, i=0 sol kanat)
const SUBROLES = {
  DEF: {
    1: ['CB'],
    2: ['LB', 'RB'],
    3: ['LB', 'CB', 'RB'],
    4: ['LB', 'CB', 'CB', 'RB'],
  },
  MID: {
    1: ['CM'],
    2: ['CM', 'CM'],
    3: ['LM', 'CM', 'RM'],
    4: ['LM', 'CDM', 'CM', 'RM'],
  },
  FWD: {
    1: ['ST'],
    2: ['LW', 'RW'],
    3: ['LW', 'ST', 'RW'],
  },
  GK: {
    1: ['GK'],
  },
};

// Formatlar
export const FORMATS = [
  { value: '6v6', label: '6 vs 6', fieldPlayers: 5 },
  { value: '7v7', label: '7 vs 7', fieldPlayers: 6 },
  { value: '8v8', label: '8 vs 8', fieldPlayers: 7 },
];

// Formasyonlar (kaleci hariç alan oyuncusu sayısına göre)
export const FORMATIONS = {
  '6v6': [
    { value: '2-2-1', label: '2-2-1' },
    { value: '3-1-1', label: '3-1-1' },
    { value: '2-1-2', label: '2-1-2' },
    { value: '1-3-1', label: '1-3-1' },
  ],
  '7v7': [
    { value: '3-2-1', label: '3-2-1' },
    { value: '2-3-1', label: '2-3-1' },
    { value: '2-2-2', label: '2-2-2' },
    { value: '3-1-2', label: '3-1-2' },
    { value: '1-3-2', label: '1-3-2' },
  ],
  '8v8': [
    { value: '3-3-1', label: '3-3-1' },
    { value: '3-2-2', label: '3-2-2' },
    { value: '2-3-2', label: '2-3-2' },
    { value: '2-4-1', label: '2-4-1' },
    { value: '4-2-1', label: '4-2-1' },
  ],
};

/**
 * Bir formasyonun slot pozisyonlarını üretir (Takım A perspektifinden).
 * Kaleci her zaman dahil. Her slotta subRole bilgisi bulunur.
 *
 * @param {string} formation - Örn: "3-2-1"
 * @returns {Array<{x, y, role, subRole, id}>}
 */
export function generateSlots(formation) {
  const layers = formation.split('-').map(Number);
  const slots  = [];

  // Kaleci (sabit)
  slots.push({ x: 6, y: 50, role: 'GK', subRole: 'GK', id: 'gk' });

  // Katman X pozisyonları
  const layerCount = layers.length;
  const xPositions = [];
  if (layerCount === 3) xPositions.push(20, 33, 44);
  else if (layerCount === 2) xPositions.push(22, 40);

  const roles = ['DEF', 'MID', 'FWD'];

  layers.forEach((count, layerIndex) => {
    const x    = xPositions[layerIndex];
    const role = roles[layerIndex] || 'MID';

    // Bu role ve count için subRole listesini al
    const subRoleList = SUBROLES[role]?.[count] || Array(count).fill(role);

    // Y pozisyonlarını eşit aralıklı dağıt
    const spacing = 80 / (count + 1);

    for (let i = 0; i < count; i++) {
      const y = 10 + spacing * (i + 1);
      slots.push({
        x,
        y,
        role,
        subRole: subRoleList[i] || role,
        id: `${role.toLowerCase()}_${i}`,
      });
    }
  });

  return slots;
}

/**
 * Takım A slotlarını Takım B'ye aynalar (x koordinatını ters çevirir).
 * subRole'da LB ↔ RB, LM ↔ RM, LW ↔ RW otomatik olarak takas edilir.
 */
const MIRROR_SUBROLE = {
  LB: 'RB', RB: 'LB',
  LM: 'RM', RM: 'LM',
  LW: 'RW', RW: 'LW',
};

export function mirrorSlots(slots) {
  return slots.map(slot => ({
    ...slot,
    x: 100 - slot.x,
    subRole: MIRROR_SUBROLE[slot.subRole] || slot.subRole,
    id: `b_${slot.id}`,
  }));
}
