export const runtime = "edge";
import { store, todayKey, nowIso, dateToScore } from "../../../lib/kv";

export async function POST(req) {
  try {
    const { userId, name, tz } = await req.json();
    if (!userId || !name) {
      return new Response(JSON.stringify({ ok: false, error: "userId & name wajib diisi" }), { status: 400 });
    }
    const date = todayKey(tz || "Asia/Singapore");
    const key = `attendance:${date}:${userId}`;

    const current = await store.hgetall(key);
    if (current && current.checkIn) {
      return Response.json({ ok: true, message: "Sudah absen masuk hari ini", data: current });
    }

    const payload = {
      userId, name, date, tz: tz || "Asia/Singapore",
      checkIn: nowIso()
    };
    await store.hset(key, payload);
    await store.sadd("users", userId);
    await store.hset(`user:${userId}`, { userId, name });
    await store.zadd(`attendance_idx:${userId}`, { score: dateToScore(date), member: date });

    return Response.json({ ok: true, message: "Absen masuk berhasil", data: payload });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || "Terjadi kesalahan" }), { status: 500 });
  }
}
