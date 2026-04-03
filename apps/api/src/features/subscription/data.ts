interface Price {
  price: number;
  time: number;
  bonus?: number;
}

const DAY = 86_400;

export const dataPrice: Price[] = [
  { price: 1_000, time: 1 * DAY },
  { price: 3_000, time: 3 * DAY, bonus: 1 * DAY },
  { price: 5_000, time: 5 * DAY, bonus: 3 * DAY },
  { price: 10_000, time: 10 * DAY, bonus: 8 * DAY },
  { price: 20_000, time: 20 * DAY, bonus: 20 * DAY },
  { price: 50_000, time: 50 * DAY, bonus: 70 * DAY },
  { price: 100_000, time: 100 * DAY, bonus: 265 * DAY },
];
