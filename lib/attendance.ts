'use client';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, orderBy, startAt, endAt, getDocs, Timestamp } from 'firebase/firestore';

const pad = (n:number)=> String(n).padStart(2,'0');
const toLocalDateKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

export function startOfWeek(d=new Date()){ const t=new Date(d.getFullYear(),d.getMonth(),d.getDate()); const day=t.getDay(); const diff=(day===0?-6:1-day); t.setDate(t.getDate()+diff); t.setHours(0,0,0,0); return t; }
export function endOfWeek(d=new Date()){ const s=startOfWeek(d); const e=new Date(s); e.setDate(s.getDate()+6); e.setHours(23,59,59,999); return e; }
export function startOfMonth(d=new Date()){ return new Date(d.getFullYear(), d.getMonth(), 1); }
export function endOfMonth(d=new Date()){ return new Date(d.getFullYear(), d.getMonth()+1, 0, 23,59,59,999); }

function fmtTime(ts:any){ if(!ts) return '-'; const d = ts?.toDate ? ts.toDate() : new Date(ts); return d.toLocaleString(); }
function durationHours(startTs:any, endTs:any){ if(!startTs || !endTs) return 0; const s = startTs.toDate ? startTs.toDate() : new Date(startTs); const e = endTs.toDate ? endTs.toDate() : new Date(endTs); const ms = Math.max(0, e as any - s as any); return +(ms/36e5).toFixed(2); }

function attDocRef(uid:string, dateKey:string){ return doc(db, 'users', uid, 'attendance', dateKey); }
function attCollectionRef(uid:string){ return collection(db, 'users', uid, 'attendance'); }

export async function clockIn(uid:string){
  const dateKey = toLocalDateKey(new Date());
  const ref = attDocRef(uid, dateKey);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().clockIn) throw new Error('Anda sudah absen masuk hari ini.');
  await setDoc(ref, { dateKey, clockIn: serverTimestamp() }, { merge: true });
}

export async function clockOut(uid:string){
  const dateKey = toLocalDateKey(new Date());
  const ref = attDocRef(uid, dateKey);
  const snap = await getDoc(ref);
  if (!snap.exists() || !snap.data().clockIn) throw new Error('Anda belum absen masuk hari ini.');
  if (snap.data().clockOut) throw new Error('Anda sudah absen pulang hari ini.');
  await updateDoc(ref, { clockOut: serverTimestamp() });
}

export async function getToday(uid:string){
  const dateKey = toLocalDateKey(new Date());
  const ref = attDocRef(uid, dateKey);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const d:any = snap.data();
  return {
    tanggal: dateKey,
    masuk: fmtTime(d.clockIn),
    pulang: fmtTime(d.clockOut),
    durasi: durationHours(d.clockIn, d.clockOut)
  };
}

export async function getRange(uid:string, startDate:Date, endDate:Date){
  const startKey = toLocalDateKey(startDate);
  const endKey = toLocalDateKey(endDate);
  const qy = query(attCollectionRef(uid), orderBy('dateKey'), startAt(startKey), endAt(endKey));
  const qs = await getDocs(qy);
  const rows:any[] = [];
  let total=0;
  qs.forEach(snap=>{
    const d:any = snap.data();
    const jam = durationHours(d.clockIn, d.clockOut);
    total += jam;
    rows.push({
      tanggal: d.dateKey,
      masuk: fmtTime(d.clockIn),
      pulang: fmtTime(d.clockOut),
      durasi: jam
    });
  });
  rows.sort((a,b)=> a.tanggal.localeCompare(b.tanggal));
  return rows;
}
