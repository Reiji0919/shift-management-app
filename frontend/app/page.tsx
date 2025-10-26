'use client';
import { useEffect, useState } from 'react';

export default function Page() {
  const [msg, setMsg] = useState<string>('Loading...');

  // useEffect(() => {
  //   const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:8000';

  //   fetch(`${base}/hello?name=Next.js`)
  //     .then(res => res.json())
  //     .then(data => setMsg(data.message))
  //     .catch(() => setMsg('API error'));
  // }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Next * FastAPI</h1>
      <p>APIの返事: {msg}</p>
    </main>
  );
}
