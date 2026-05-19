/**
 * Formasyon Konfigürasyonu
 * 
 * Her formasyon, slot pozisyonlarını yüzde (%) cinsinden tanımlar.
 * Saha sol yarısı (Takım A): x=0-50%, sağ yarısı (Takım B): x=50-100%
 * Takım B'nin koordinatları, Takım A'nın ayna (mirror) yansımasıdır.
 * 
 * Her slot: { x, y, role }
 *   - role: "GK" | "DEF" | "MID" | "FWD"
 *   - x, y: Takım A için yüzde pozisyon
 */

// Etiket-Mevki eşleşme tablosu
export const TAG_MAP = {
  GK: ['Kaleci'],
  DEF: ['Defans', 'Stoper'],
  MID: ['Orta Saha', 'Box-to-box'],
  FWD: ['Forvet', 'Kanat', 'Hızlı', 'Yaratıcı', 'Target Man', 'Dribling']
};

// Mevki Türkçe isimleri
export const ROLE_LABELS = {
  GK: 'Kaleci',
  DEF: 'Defans',
  MID: 'Orta Saha',
  FWD: 'Forvet'
};

// Formatlar
export const FORMATS = [
  { value: '6v6', label: '6 vs 6', fieldPlayers: 5 },
  { value: '7v7', label: '7 vs 7', fieldPlayers: 6 },
  { value: '8v8', label: '8 vs 8', fieldPlayers: 7 }
];

// Formasyonlar (kaleci hariç alan oyuncusu sayısına göre)
export const FORMATIONS = {
  '6v6': [
    { value: '2-2-1', label: '2-2-1' },
    { value: '3-1-1', label: '3-1-1' },
    { value: '2-1-2', label: '2-1-2' },
    { value: '1-3-1', label: '1-3-1' }
  ],
  '7v7': [
    { value: '3-2-1', label: '3-2-1' },
    { value: '2-3-1', label: '2-3-1' },
    { value: '2-2-2', label: '2-2-2' },
    { value: '3-1-2', label: '3-1-2' },
    { value: '1-3-2', label: '1-3-2' }
  ],
  '8v8': [
    { value: '3-3-1', label: '3-3-1' },
    { value: '3-2-2', label: '3-2-2' },
    { value: '2-3-2', label: '2-3-2' },
    { value: '2-4-1', label: '2-4-1' },
    { value: '4-2-1', label: '4-2-1' }
  ]
};

/**
 * Bir formasyonun slot pozisyonlarını üretir (Takım A perspektifinden).
 * Kaleci her zaman dahil.
 * 
 * @param {string} formation - Örn: "3-2-1"
 * @returns {Array<{x: number, y: number, role: string, id: string}>}
 */
export function generateSlots(formation) {
  const layers = formation.split('-').map(Number);
  const slots = [];

  // Kaleci (en arkada)
  slots.push({ x: 6, y: 50, role: 'GK', id: 'gk' });

  // Katman X pozisyonları (soldan sağa, kaleciden ileriye)
  const layerCount = layers.length;
  const xPositions = [];
  
  if (layerCount === 3) {
    xPositions.push(20, 33, 44); // DEF, MID, FWD
  } else if (layerCount === 2) {
    xPositions.push(22, 40);
  }

  const roles = ['DEF', 'MID', 'FWD'];

  layers.forEach((count, layerIndex) => {
    const x = xPositions[layerIndex];
    const role = roles[layerIndex] || 'MID';

    // Y pozisyonlarını eşit aralıklı dağıt
    const spacing = 80 / (count + 1);

    for (let i = 0; i < count; i++) {
      const y = 10 + spacing * (i + 1);
      slots.push({
        x,
        y,
        role,
        id: `${role.toLowerCase()}_${i}`
      });
    }
  });

  return slots;
}

/**
 * Takım A slotlarını Takım B'ye aynalar (x koordinatını ters çevirir)
 */
export function mirrorSlots(slots) {
  return slots.map(slot => ({
    ...slot,
    x: 100 - slot.x,
    id: `b_${slot.id}`
  }));
}
