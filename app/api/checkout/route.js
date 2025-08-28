export const runtime = "edge";
import { store, todayKey, nowIso } from "../../../lib/kv";

export async function POST(req) {
  try {
    const { userId, tz } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ ok: false, error: "userId wajib diisi" }), { status: 400 });
    }
    const date = todayKey(tz || "Asia/Singapore");
    const key = `attendance:${date}:${userId}`;

    const current = await store.hgetall(key);
    if (!current || !current.checkIn) {
      return new Response(JSON.stringify({ ok: false, error: "Belum absen masuk" }), { status: 400 });
    }
    if (current.checkOut) {
      return Response.json({ ok: true, message: "Sudah absen pulang", data: current });
    }

    const updated = { ...current, checkOut: nowIso() };
    await store.hset(key, updated);
    return Response.json({ ok: true, message: "Absen pulang berhasil", data: updated });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || "Terjadi kesalahan" }), { status: 500 });
  }
}
