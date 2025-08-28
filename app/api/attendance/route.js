export const runtime = "edge";
import { store, todayKey } from "../../../lib/kv";

// GET /api/attendance?userId=... -> history user (maks 30 hari)
// GET /api/attendance?adminKey=...&date=YYYY-MM-DD -> rekap tanggal tsb (admin)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const adminKey = searchParams.get("adminKey");
    const date = searchParams.get("date") || todayKey(searchParams.get("tz") || "Asia/Singapore");

    if (userId) {
      const idxKey = `attendance_idx:${userId}`;
      const dates = await store.zrange(idxKey, -30, -1); // last 30 (ascending slice), then limit
      const result = [];
      for (const d of dates) {
        const key = `attendance:${d}:${userId}`;
        const rec = await store.hgetall(key);
        if (rec) result.push(rec);
      }
      // sort desc by date
      result.sort((a,b) => (a.date < b.date ? 1 : -1));
      const user = await store.hgetall(`user:${userId}`);
      return Response.json({ ok: true, user, records: result });
    }

    // Admin view
    if (adminKey) {
      if (adminKey !== (process.env.ADMIN_KEY || "")) {
        return new Response(JSON.stringify({ ok: false, error: "Admin key salah" }), { status: 401 });
      }
      const users = await store.smembers("users");
      const rows = [];
      for (const uid of users) {
        const user = await store.hgetall(`user:${uid}`);
        const rec = await store.hgetall(`attendance:${date}:${uid}`);
        rows.push({
          userId: uid,
          name: user?.name || uid,
          date,
          checkIn: rec?.checkIn || null,
          checkOut: rec?.checkOut || null
        });
      }
      // sort by name
      rows.sort((a,b) => (a.name || "").localeCompare(b.name || ""));
      return Response.json({ ok: true, date, rows });
    }

    return new Response(JSON.stringify({ ok: false, error: "Parameter tidak valid" }), { status: 400 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message || "Terjadi kesalahan" }), { status: 500 });
  }
}
