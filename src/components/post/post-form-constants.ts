export const RICE_TYPES = [
  "Soft rice (ဆန်ပျော့)",
  "Hard rice (ဆန်မာ)",
  "Glutinous rice (ကောက်ညင်)",
  "Jasmine rice (ဂျက်မင် ဆန်)",
];

export const MEASURING = [
  { value: "pound", label: "Weighting scale" },
  { value: "tin", label: "Tin container" },
];

export const PRICE_MIN = 500_000; // 5 lakh
export const PRICE_MAX = 7_500_000; // 75 lakh
export const PRICE_STEP = 5_000;

export const QTY_MIN = 100;
export const QTY_MAX = 100_000;
export const QTY_STEP = 50;

export const POUND_MIN = 92;
export const POUND_MAX = 120;

export function formatLakh(n: number): string {
  return `${n.toLocaleString()} Ks`;
}
