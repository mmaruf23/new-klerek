const DAY = 86_400;

export interface SubscriptionPackage {
  price: number;
  time: number;
  bonus?: number;
  name: string;
  desc: string;
  badge?: 'POPULER' | 'HEMAT';
}

export const dataPrice: SubscriptionPackage[] = [
  { price: 1_000,   time: 1   * DAY,                  name: 'Harian',   desc: 'Sekali pakai untuk satu rekap.' },
  { price: 3_000,   time: 3   * DAY, bonus: 1   * DAY, name: '3 Hari',   desc: 'Lebih hemat dari harian.' },
  { price: 5_000,   time: 5   * DAY, bonus: 3   * DAY, name: 'Mingguan', desc: 'Cocok untuk seminggu penuh.' },
  { price: 10_000,  time: 10  * DAY, bonus: 8   * DAY, name: '2 Minggu', desc: 'Hemat untuk dua minggu.' },
  { price: 20_000,  time: 20  * DAY, bonus: 20  * DAY, name: 'Bulanan',  desc: 'Paling sering dipilih.',  badge: 'POPULER' },
  { price: 50_000,  time: 50  * DAY, bonus: 70  * DAY, name: '4 Bulan',  desc: 'Untuk toko yang aktif.' },
  { price: 100_000, time: 100 * DAY, bonus: 265 * DAY, name: 'Tahunan',  desc: 'Hemat sampai 73%.',       badge: 'HEMAT' },
];
