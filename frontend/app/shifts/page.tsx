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

const base =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// フォームの値（YYYY-MM-DDTHH:MM）をサーバーに送る文字列へ
const toLocalDatetimeString = (dt: string) => {
  if (!dt) return '';
  // 秒が無いので「:00」を足す（例: 2025-11-30T10:30 → 2025-11-30T10:30:00）
  return `${dt}:00`;
};

export default function ShiftsPage() {
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [note, setNote] = useState('');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const fetchShifts = async () => {
    try {
      setLoading(true);
      setErr('');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');

    try {
      const body = {
        user_name: userName.trim(),
        role: role.trim() || null,
        start_at: toLocalDatetimeString(startAt),
        end_at: toLocalDatetimeString(endAt),
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
    setErr('');
    try {
      const res = await fetch(`${base}/shifts/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 204) {
        throw new Error(await res.text());
      }
      await fetchShifts();
    } catch (e: unknown) {
      if (e instanceof Error) setErr(e.message);
      else setErr(String(e));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* ヘッダー */}
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            シフト管理
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            アルバイトのシフトを登録・確認できます。
          </p>
        </header>

        {/* 入力カード */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-900 mb-4">
              シフト入力
            </h2>

            <form
              onSubmit={submit}
              className="grid grid-cols-2 gap-4 md:gap-6"
            >
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700">
                  名前
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  開始
                </label>
                <input
                  type="datetime-local"
                  step={60 * 30}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  終了
                </label>
                <input
                  type="datetime-local"
                  step={60 * 30}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  備考（任意）
                </label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="md:col-span-2 flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? '送信中…' : 'シフトを登録'}
                </button>
              </div>
            </form>

            {err && (
              <p className="mt-3 text-sm text-red-600">
                エラー: {err}
              </p>
            )}
          </div>
        </section>

        {/* 一覧カード */}
        <section>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-slate-900">
                登録済みシフト
              </h2>
              <button
                type="button"
                onClick={fetchShifts}
                className="text-xs md:text-sm inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                再読み込み
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">読み込み中...</p>
            ) : shifts.length === 0 ? (
              <p className="text-sm text-slate-500">
                まだシフトが登録されていません。
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-3 py-2 font-semibold">名前</th>
                      <th className="px-3 py-2 font-semibold">開始</th>
                      <th className="px-3 py-2 font-semibold">終了</th>
                      <th className="px-3 py-2 font-semibold text-right">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-3 py-2">{s.user_name}</td>
                        <td className="px-3 py-2">{s.role || '-'}</td>
                        <td className="px-3 py-2">
                          {new Date(s.start_at).toLocaleString('ja-JP')}
                        </td>
                        <td className="px-3 py-2">
                          {new Date(s.end_at).toLocaleString('ja-JP')}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => del(s.id)}
                            className="inline-flex items-center rounded-md border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
