/**
 * Seed Script - Test oyuncularını MongoDB'ye ekler
 * Kullanım: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Player = require('./models/Player');

const seedPlayers = [
  {
    name: 'Ahmet Yılmaz',
    nickname: 'El Matador',
    number: 10,
    photo: 'default.png',
    position: 'ST',
    tags: ['Forvet', 'Kanat'],
    motto: 'Gol yemekten güzeldir ama atmak daha güzel.',
    stats: { pace: 78, shooting: 85, passing: 70, dribbling: 80, defending: 30, physical: 72 },
    marketValue: 120
  },
  {
    name: 'Mehmet Demir',
    nickname: 'Duvar',
    number: 4,
    photo: 'default.png',
    position: 'CB',
    tags: ['Stoper', 'Defans'],
    motto: 'Buradan geçiş yok.',
    stats: { pace: 55, shooting: 30, passing: 50, dribbling: 40, defending: 88, physical: 85 },
    marketValue: 95
  },
  {
    name: 'Can Kaya',
    nickname: 'Motor',
    number: 8,
    photo: 'default.png',
    position: 'CM',
    tags: ['Orta Saha', 'Box-to-box'],
    motto: 'Sahada iki tane ben var sanırsınız.',
    stats: { pace: 72, shooting: 65, passing: 82, dribbling: 75, defending: 68, physical: 78 },
    marketValue: 100
  },
  {
    name: 'Burak Aydın',
    nickname: 'Fırtına',
    number: 7,
    photo: 'default.png',
    position: 'LW',
    tags: ['Kanat', 'Hızlı'],
    motto: 'Hızımı gördüğünde çoktan geçmişimdir.',
    stats: { pace: 92, shooting: 68, passing: 60, dribbling: 85, defending: 25, physical: 60 },
    marketValue: 110
  },
  {
    name: 'Emre Şahin',
    nickname: 'Örümcek',
    number: 1,
    photo: 'default.png',
    position: 'GK',
    tags: ['Kaleci'],
    motto: 'Kalemin önünde geçilmez bir duvar.',
    stats: { pace: 40, shooting: 15, passing: 55, dribbling: 30, defending: 80, physical: 82 },
    marketValue: 75
  },
  {
    name: 'Ali Koç',
    nickname: 'Maestro',
    number: 6,
    photo: 'default.png',
    position: 'CAM',
    tags: ['Orta Saha', 'Yaratıcı'],
    motto: 'Asist yapanı gol atan unutmaz.',
    stats: { pace: 65, shooting: 72, passing: 90, dribbling: 82, defending: 35, physical: 55 },
    marketValue: 105
  },
  {
    name: 'Oğuz Kara',
    nickname: 'Tank',
    number: 9,
    photo: 'default.png',
    position: 'ST',
    tags: ['Forvet', 'Target Man'],
    motto: 'Kafa golü yemek istemiyorsan uzak dur.',
    stats: { pace: 50, shooting: 80, passing: 45, dribbling: 55, defending: 40, physical: 90 },
    marketValue: 85
  },
  {
    name: 'Serkan Yıldız',
    nickname: 'Tilki',
    number: 11,
    photo: 'default.png',
    position: 'RW',
    tags: ['Kanat', 'Dribling'],
    motto: 'Çalımdan sonra geriye bakmam.',
    stats: { pace: 85, shooting: 70, passing: 65, dribbling: 88, defending: 28, physical: 58 },
    marketValue: 100
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Mevcut oyuncuları sil
    await Player.deleteMany({});
    console.log('🗑️  Mevcut oyuncular silindi');

    // Yeni oyuncuları ekle
    for (const playerData of seedPlayers) {
      const player = new Player(playerData);
      player.marketHistory.push({
        value: player.marketValue,
        date: new Date(),
        reason: 'Başlangıç'
      });
      await player.save();
      console.log(`⚽ ${player.name} (${player.nickname}) eklendi - OVR: ${player.overall}`);
    }

    console.log(`\n🎉 ${seedPlayers.length} oyuncu başarıyla eklendi!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed hatası:', error.message);
    process.exit(1);
  }
}

seed();
