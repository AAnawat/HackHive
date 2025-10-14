// src/pages/ProblemsPage.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { getProblems, getProblemCategories } from '../api/client';
import type { Problem, Difficulty } from '../types';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';   // ← ใช้ AuthContext

export default function ProblemsPage() {
  const location = useLocation();
  const { token /*, user */ } = useAuth();         // ← เอา token มาดูสถานะล็อกอิน

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState<number | null>(null);

  const [justCreatedId, setJustCreatedId] = useState<number | null>(null);
  const newCardRef = useRef<HTMLAnchorElement | null>(null);

  // รับ ?new=<id> เพื่อไฮไลต์การ์ดล่าสุด
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const id = sp.get('new');
    if (id) { setJustCreatedId(Number(id)); setPage(1); }
    else setJustCreatedId(null);
  }, [location.search]);

  // โหลดรายการโจทย์
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getProblems({
      problem: query || undefined,
      difficulty: (difficulty as Difficulty) || undefined,
      page,
      perPage,
      categories: selectedCategory ? [selectedCategory] : undefined,
    })
      .then((data: any) => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          setProblems(data); setTotal(null);
        } else if (data && Array.isArray(data.items)) {
          setProblems(data.items);
          setTotal(typeof data.total === 'number' ? data.total : data.items.length);
        } else {
          setProblems([]); setTotal(null);
        }
      })
      .catch((e) => !cancelled && setError(e.message || 'Failed to load'))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [query, difficulty, selectedCategory, page, perPage]);

  // โหลดหมวดหมู่ครั้งเดียว
  useEffect(() => {
    let cancelled = false;
    getProblemCategories()
      .then((res) => !cancelled && setCategories(res.categories || []))
      .catch(() => !cancelled && setCategories([]));
    return () => { cancelled = true; };
  }, []);

  // เลื่อนไปยังการ์ดที่เพิ่งสร้าง
  useEffect(() => {
    if (!loading && justCreatedId && newCardRef.current) {
      newCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [loading, justCreatedId]);

  // รีเซ็ตไปหน้าแรกเมื่อ filter/perPage เปลี่ยน
  useEffect(() => { setPage(1); }, [query, difficulty, selectedCategory, perPage]);

  const canPrev = useMemo(() => page > 1, [page]);
  const totalPages = useMemo(
    () => (total == null ? null : Math.max(1, Math.ceil(total / perPage))),
    [total, perPage]
  );
  const canNext = useMemo(() => (totalPages == null ? true : page < totalPages), [page, totalPages]);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Problems</h1>

        {/* แสดงปุ่ม Add เฉพาะตอนล็อกอินแล้ว */}
        {token && (
          <Link
            to="/problems/add"
            className="px-3 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-400 transition"
          >
            Add Problem
          </Link>
        )}
      </div>

      <div className="flex items-end gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm mb-1">Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Problem name"
            className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            className="px-3 py-2 rounded bg-neutral-900 border border-neutral-800"
          >
            <option value="">All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded bg-neutral-900 border border-neutral-800"
          >
            <option value="">All</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Per page</label>
          <select
            value={perPage}
            onChange={(e) => setPerPage(parseInt(e.target.value))}
            className="px-3 py-2 rounded bg-neutral-900 border border-neutral-800"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-400">{error}</div>}

      {!loading && !error && (
        problems.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {problems.map((p) => {
              const isNew = justCreatedId === p.id;
              return (
                <Link
                  to={`/problems/${p.id}`}
                  key={p.id}
                  ref={isNew ? newCardRef : null}
                  className={`block border border-neutral-800 rounded p-4 hover:border-yellow-500 ${isNew ? 'border-yellow-500 ring-2 ring-yellow-500' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{p.problem}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-neutral-800">{p.difficulty}</span>
                  </div>
                  <p className="text-neutral-300 mt-2 line-clamp-3">{p.description}</p>
                  {p.categories?.length ? (
                    <div className="mt-2 text-xs text-neutral-400">{p.categories.join(', ')}</div>
                  ) : null}
                  <div className="mt-3 text-sm text-neutral-400">
                    Score: {p.score} · Likes: {p.like ?? 0}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-neutral-400">No problems found.</div>
        )
      )}

      <div className="flex items-center gap-2 mt-6">
        <button
          disabled={!canPrev}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 rounded bg-neutral-800 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm">Page {page}{totalPages ? ` / ${totalPages}` : ''}</span>
        <button
          disabled={!canNext}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 rounded bg-neutral-800 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </AppLayout>
  );
}
