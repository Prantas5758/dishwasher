import { kv } from "@vercel/kv";
export const store = kv;

// Helpers for dates
export function todayKey(tz = "Asia/Singapore") {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  return f.format(new Date()); // YYYY-MM-DD
}
export function nowIso() {
  return new Date().toISOString();
}
export function dateToScore(dateKey /* YYYY-MM-DD */) {
  return Number(dateKey.replaceAll("-", "")); // e.g. 20250828
}
