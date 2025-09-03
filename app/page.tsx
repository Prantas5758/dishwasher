'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth, ensureFirebase } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    ensureFirebase();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setMsg('');
    });
    return () => unsub();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setMsg('');
    if (!email || !password) return setMsg('Isi email & password.');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password.trim());
    } catch (e) { setMsg(e.message); }
  }
  async function handleRegister() {
    setMsg('');
    if (!email || !password) return setMsg('Isi email & password.');
    if (password.length < 6) return setMsg('Password minimal 6 karakter.');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
      setMsg('Akun dibuat. (Opsional) set nama panggilan di bawah.');
    } catch (e) { setMsg(e.message); }
  }
  async function handleSaveName() {
    if (!user) return;
    if (!name.trim()) return setMsg('Nama tidak boleh kosong.');
    try {
      await updateProfile(user, { displayName: name.trim() });
      setMsg('Nama disimpan.');
    } catch (e) { setMsg(e.message); }
  }

  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <div>
      {!user && (
        <div className="card">
          <h2>Masuk / Daftar</h2>
          <form onSubmit={handleLogin}>
            <label>Email
              <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="nama@contoh.com" required />
            </label>
            <label>Password
              <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="••••••••" required />
            </label>
            <div className="row">
              <button type="submit">Masuk</button>
              <button type="button" className="secondary" onClick={handleRegister}>Daftar</button>
            </div>
            <p className="hint">Jika belum punya akun, klik <b>Daftar</b>.</p>
          </form>
          {msg && <p className="hint">{msg}</p>}
        </div>
      )}
      {user && (
        <div className="card">
          <div className="row space-between">
            <div>
              <div>Masuk sebagai: <b>{user.displayName || '(tanpa nama)'}</b></div>
              <div className="hint">{user.email}</div>
            </div>
            <div className="row">
              <button onClick={handleLogout} className="danger">Keluar</button>
              <Link href="/dashboard"><button>Masuk ke Dashboard</button></Link>
            </div>
          </div>
          <div className="row" style={{marginTop:8}}>
            <input placeholder="Nama panggilan Anda" value={name} onChange={e=>setName(e.target.value)} />
            <button className="secondary" onClick={handleSaveName}>Simpan Nama</button>
          </div>
          {msg && <p className="hint">{msg}</p>}
        </div>
      )}
    </div>
  );
}
