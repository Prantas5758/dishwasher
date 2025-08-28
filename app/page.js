"use client";

import { useEffect, useMemo, useState } from "react";
import { classNames, formatDateTime } from "../lib/utils";

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        "tab",
        active ? "bg-indigo-600 text-white border-indigo-600" : "bg-transparent text-indigo-700 border-indigo-300 dark:text-indigo-300 dark:border-indigo-700"
      )}
    >
      {children}
    </button>
  );
}

export default function Home() {
  const [tab, setTab] = useState("masuk");
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const [statusMsg, setStatusMsg] = useState(null);

  const [cekUserId, setCekUserId] = useState("");
  const [history, setHistory] = useState(null);

  const [adminKey, setAdminKey] = useState("");
  const [adminDate, setAdminDate] = useState("");
  const [adminRows, setAdminRows] = useState(null);
  const [adminError, setAdminError] = useState(null);

  useEffect(() => {
    setAdminDate(new Date().toLocaleDateString("en-CA", { timeZone: tz }));
  }, [tz]);

  async function submitMasuk() {
    setStatusMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name, tz })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Gagal");
      setStatusMsg(data.message || "Berhasil absen masuk");
    } catch (e) {
      setStatusMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitPulang() {
    setStatusMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tz })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Gagal");
      setStatusMsg(data.message || "Berhasil absen pulang");
    } catch (e) {
      setStatusMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchHistory() {
    setHistory(null);
    if (!cekUserId) return;
    const url = `/api/attendance?userId=${encodeURIComponent(cekUserId)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.ok) setHistory(data);
    else setHistory({ error: data.error || "Gagal mengambil data" });
  }

  async function fetchAdmin() {
    setAdminError(null);
    setAdminRows(null);
    try {
      const url = `/api/attendance?adminKey=${encodeURIComponent(adminKey)}&date=${encodeURIComponent(adminDate)}&tz=${encodeURIComponent(tz)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Gagal");
      setAdminRows(data.rows);
    } catch (e) {
      setAdminError(e.message);
    }
  }

  return (
    <main className="container py-10 space-y-6">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold">📍 Absensi Kerja</h1>
        <p className="text-gray-600 dark:text-gray-300">Sederhana, profesional, & berjalan di Vercel. Zona waktu: <b>{tz}</b></p>
      </header>

      <div className="flex gap-2 justify-center">
        <TabButton active={tab === "masuk"} onClick={() => setTab("masuk")}>Absen Masuk</TabButton>
        <TabButton active={tab === "pulang"} onClick={() => setTab("pulang")}>Absen Pulang</TabButton>
        <TabButton active={tab === "cek"} onClick={() => setTab("cek")}>Cek Absen</TabButton>
        <TabButton active={tab === "admin"} onClick={() => setTab("admin")}>Admin</TabButton>
      </div>

      {tab === "masuk" && (
        <section className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">ID Karyawan</label>
              <input className="input" value={userId} onChange={e => setUserId(e.target.value)} placeholder="misal: EMP001" />
            </div>
            <div>
              <label className="block text-sm mb-1">Nama Lengkap</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="misal: Budi Santoso" />
            </div>
          </div>
          <button className="btn" disabled={loading} onClick={submitMasuk}>{loading ? "Memproses..." : "Absen Masuk"}</button>
          {statusMsg && <p className="text-sm text-gray-700 dark:text-gray-300">{statusMsg}</p>}
          <p className="text-xs text-gray-500">* Sistem akan otomatis membuat user baru saat absen pertama kali.</p>
        </section>
      )}

      {tab === "pulang" && (
        <section className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">ID Karyawan</label>
              <input className="input" value={userId} onChange={e => setUserId(e.target.value)} placeholder="misal: EMP001" />
            </div>
          </div>
          <button className="btn" disabled={loading} onClick={submitPulang}>{loading ? "Memproses..." : "Absen Pulang"}</button>
          {statusMsg && <p className="text-sm text-gray-700 dark:text-gray-300">{statusMsg}</p>}
        </section>
      )}

      {tab === "cek" && (
        <section className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">ID Karyawan</label>
              <input className="input" value={cekUserId} onChange={e => setCekUserId(e.target.value)} placeholder="misal: EMP001" />
            </div>
            <div className="flex items-end">
              <button className="btn w-full" onClick={fetchHistory}>Cek</button>
            </div>
          </div>

          {history?.error && <p className="text-red-500">{history.error}</p>}

          {history?.records && (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Masuk</th>
                    <th>Pulang</th>
                  </tr>
                </thead>
                <tbody>
                  {history.records.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.date}</td>
                      <td>{r.checkIn ? formatDateTime(r.checkIn, r.tz) : "-"}</td>
                      <td>{r.checkOut ? formatDateTime(r.checkOut, r.tz) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "admin" && (
        <section className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Admin Key</label>
              <input className="input" type="password" value={adminKey} onChange={e => setAdminKey(e.target.value)} placeholder="Masukkan ADMIN_KEY" />
            </div>
            <div>
              <label className="block text-sm mb-1">Tanggal</label>
              <input className="input" type="date" value={adminDate} onChange={e => setAdminDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button className="btn w-full" onClick={fetchAdmin}>Lihat Rekap</button>
            </div>
          </div>

          {adminError && <p className="text-red-500">{adminError}</p>}

          {adminRows && (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama</th>
                    <th>Tanggal</th>
                    <th>Masuk</th>
                    <th>Pulang</th>
                  </tr>
                </thead>
                <tbody>
                  {adminRows.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.userId}</td>
                      <td>{r.name}</td>
                      <td>{r.date}</td>
                      <td>{r.checkIn ? formatDateTime(r.checkIn) : "-"}</td>
                      <td>{r.checkOut ? formatDateTime(r.checkOut) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-xs text-gray-500">* Set variabel lingkungan <code>ADMIN_KEY</code> di Vercel untuk mengakses rekap admin.</p>
        </section>
      )}

      <footer className="text-center text-xs text-gray-500 py-6">
        © {new Date().getFullYear()} Absensi Kerja · Dibuat dengan Next.js + Vercel KV
      </footer>
    </main>
  );
}
