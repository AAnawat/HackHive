import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { getProblems } from '../api/client';
import type { Problem, Difficulty } from '../types';
import { Link } from 'react-router-dom';

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProblems({ problem: query || undefined, difficulty: difficulty || undefined, page, perPage })
      .then((data: any) => {
        if (cancelled) return;
        setProblems(Array.isArray(data) ? data : []);
      })
      .catch((e) => !cancelled && setError(e.message || 'Failed to load'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [query, difficulty, page, perPage]);

  const canPrev = useMemo(() => page > 1, [page]);

  return (
    <AppLayout>
      <div className="flex items-end gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm mb-1">Search</label>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Problem name" className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800" />
        </div>
        <div>
          <label className="block text-sm mb-1">Difficulty</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="px-3 py-2 rounded bg-neutral-900 border border-neutral-800">
            <option value="">All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Per page</label>
          <select value={perPage} onChange={(e) => setPerPage(parseInt(e.target.value))} className="px-3 py-2 rounded bg-neutral-900 border border-neutral-800">
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-400">{error}</div>}

      {!loading && !error && (
        <div className="grid md:grid-cols-2 gap-4">
          {problems.map((p) => (
            <Link to={`/problems/${p.id}`} key={p.id} className="block border border-neutral-800 rounded p-4 hover:border-yellow-500">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{p.problem}</h3>
                <span className="text-xs px-2 py-1 rounded bg-neutral-800">{p.difficulty}</span>
              </div>
              <p className="text-neutral-300 mt-2 line-clamp-3">{p.description}</p>
              <div className="mt-3 text-sm text-neutral-400">Score: {p.score} · Likes: {p.like ?? 0}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-6">
        <button disabled={!canPrev} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded bg-neutral-800 disabled:opacity-50">Prev</button>
        <span className="text-sm">Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded bg-neutral-800">Next</button>
      </div>
    </AppLayout>
  );
}


