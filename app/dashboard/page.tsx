'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { clockIn, clockOut, getToday, getRange, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from '../../lib/attendance';

function pad(n){ return String(n).padStart(2,'0'); }

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [rows, setRows] = useState([]);
  const [info, setInfo] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setInfo('Silakan login di halaman utama.');
      } else {
        setInfo('Pilih aksi di bawah.');
      }
    });
    return () => unsub();
  }, []);

  async function doIn() {
    if (!user) return setInfo('Anda belum login.');
    try { await clockIn(user.uid); setInfo('Berhasil absen masuk.'); await doToday(); }
    catch(e){ setInfo(String(e.message || e)); }
  }
  async function doOut() {
    if (!user) return setInfo('Anda belum login.');
    try { await clockOut(user.uid); setInfo('Berhasil absen pulang.'); await doToday(); }
    catch(e){ setInfo(String(e.message || e)); }
  }
  async function doToday() {
    if (!user) return setInfo('Anda belum login.');
    const d = await getToday(user.uid);
    if (!d) { setRows([]); setInfo('Belum ada absen hari ini.'); return; }
    setRows([d]);
  }
  async function doWeek() {
    if (!user) return setInfo('Anda belum login.');
    const rows = await getRange(user.uid, startOfWeek(new Date()), endOfWeek(new Date()));
    setRows(rows);
    setInfo(`Menampilkan ${rows.length} hari.`);
  }
  async function doMonth() {
    if (!user) return setInfo('Anda belum login.');
    const now = new Date();
    const rows = await getRange(user.uid, startOfMonth(now), endOfMonth(now));
    setRows(rows);
    setInfo(`Menampilkan ${rows.length} hari.`);
  }

  const total = rows.reduce((acc, r) => acc + (Number(r.durasi)||0), 0);

  return (
    <div>
      <div className="card">
        <div className="row space-between">
          <h2>Dashboard</h2>
          <Link href="/"><button className="secondary">⬅️ Kembali</button></Link>
        </div>
        <div className="row">
          <button onClick={doIn}>🟢 Absen Masuk</button>
          <button onClick={doOut} className="secondary">🔴 Absen Pulang</button>
          <button onClick={doToday}>📅 Cek Hari Ini</button>
          <button onClick={doWeek} className="secondary">📆 Rekap Minggu</button>
          <button onClick={doMonth}>🗓️ Rekap Bulan</button>
        </div>
        <p className="hint">Semua waktu mengikuti zona waktu perangkat Anda.</p>
        <p className="hint">{info}</p>
      </div>

      <div className="card">
        <h3>Hasil</h3>
        {rows.length === 0 ? <p className="hint">Tidak ada data.</p> : (
          <table>
            <thead>
              <tr><th>Tanggal</th><th>Masuk</th><th>Pulang</th><th>Durasi (jam)</th></tr>
            </thead>
            <tbody>
              {rows.map((r,i)=>(
                <tr key={i}>
                  <td>{r.tanggal}</td>
                  <td>{r.masuk}</td>
                  <td>{r.pulang}</td>
                  <td>{r.durasi}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan={4}><b>Total jam:</b> {total.toFixed(2)} jam</td></tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
