'use client';
import { useEffect, useState } from 'react';

type Shift = {
  id: number;
  user_name: string;
  role?: string | null;
  start_at: string;
  end_at: string;
  note?: string | null;
};

export default function ShiftsPage() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [note, setNote] = useState('');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>('');

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${base}/shifts`);
      if (!res.ok) throw new Error(await res.text());
      const data: Shift[] = await res.json();
      setShifts(data);
    } catch (e: unknown) {
      if (e instanceof Error) setErr(e.message);
      else setErr(String(e));
    } finally { 
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');

    const toISO = (v: string) => new Date(v).toISOString();

    try {
      const body = {
        user_name: userName.trim(),
        role: role.trim() || null,
        start_at: toISO(startAt),
        end_at: toISO(endAt),
        note: note.trim() || null,
      };
      const res = await fetch(`${base}/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      setUserName('');
      setRole('');
      setStartAt('');
      setEndAt('');
      setNote('');
      await fetchShifts();
    } catch (e: unknown) {
      if (e instanceof Error) setErr(e.message);
      else setErr(String(e));
    }
  };

  const del = async (id: number) => {
    if (!confirm('削除しますか？')) return;
    try {
      const res = await fetch(`${base}/shifts/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error(await res.text());
      await fetchShifts();
    } catch (e: unknown) {
      if (e instanceof Error) setErr(e.message);
      else setErr(String(e));
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1>アルバイト・シフト入力</h1>
      <form onSubmit={submit}
        style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginBottom: 24 }}>
        <label>
          お名前
          <input value={userName} onChange={e => setUserName(e.target.value)} required />
        </label>
        <label>
          開始
          <input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} required />
        </label>
         <label>
          終了
          <input type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)} required />
        </label>
        <label style={{ gridColumn: '1 / -1' }}>
          備考
          <textarea value={note} onChange={e => setNote(e.target.value)} />
        </label>
        <button type="submit">送信</button>
      </form>

      <h2>登録済みシフト</h2>
      {loading ? <p>読み込み中...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>名前</th>
              <th>開始</th>
              <th>終了</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {shifts.map(s => (
              <tr key={s.id}>
                <td>{s.user_name}</td>
                <td>{s.role || '-'}</td>
                <td>{new Date(s.start_at).toLocaleString()}</td>
                <td>{new Date(s.end_at).toLocaleString()}</td>
                <td><button onClick={() => del(s.id)}>削除</button></td>
              </tr>
            ))}
            {shifts.length === 0 && (
              <tr><td colSpan={5}>まだデータがありません</td></tr>
            )}
          </tbody>
        </table>
      )}
      {err && <p style={{ color: 'red' }}>{err}</p>}
    </main>
  );
}
