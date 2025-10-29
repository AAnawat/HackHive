import { useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { getProblems, getProblemCategories } from '../api/client';
import type { Problem, Difficulty } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';
import ProblemCard from '../components/ProblemCard';

export default function ProblemsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
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

  // --- เดา category จากคำค้น ---
  const autoCategory = useMemo(() => {
    if (!query.trim() || selectedCategory) return '';
    const q = query.trim().toLowerCase();
    const exact = categories.find((c) => c.toLowerCase() === q);
    if (exact) return exact;
    const contains = categories.find((c) => q.includes(c.toLowerCase()));
    return contains || '';
  }, [query, categories, selectedCategory]);

  const effectiveCategory = selectedCategory || autoCategory || '';

  // --- อ่าน query string ---
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const id = sp.get('new');
    const cat = sp.get('cat');
    if (id) { setJustCreatedId(Number(id)); setPage(1); }
    else setJustCreatedId(null);
    setSelectedCategory(cat || '');
  }, [location.search]);

  // --- โหลดโจทย์ ---
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const problemQuery = (effectiveCategory && !selectedCategory) ? undefined : (query || undefined);

    getProblems({
      problem: problemQuery,
      difficulty: (difficulty as Difficulty) || undefined,
      page,
      perPage,
      categories: effectiveCategory ? [effectiveCategory] : undefined,
    })
      .then((data: any) => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          setProblems(data);
          setTotal(null);
        } else if (data && Array.isArray(data.items)) {
          setProblems(data.items);
          setTotal(typeof data.total === 'number' ? data.total : data.items.length);
        } else {
          setProblems([]);
          setTotal(null);
        }
      })
      .catch((e) => !cancelled && setError(e.message || 'Failed to load'))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [query, difficulty, effectiveCategory, selectedCategory, page, perPage]);

  // --- โหลดหมวดหมู่จาก API ---
  useEffect(() => {
    let cancelled = false;
    getProblemCategories()
      .then((cats) => {
        if (!cancelled) setCategories(cats);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loading && justCreatedId && newCardRef.current) {
      newCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [loading, justCreatedId]);

  useEffect(() => { setPage(1); }, [query, difficulty, selectedCategory, perPage]);

  const canPrev = useMemo(() => page > 1, [page]);
  const totalPages = useMemo(
    () => (total == null ? null : Math.max(1, Math.ceil(total / perPage))),
    [total, perPage]
  );
  const canNext = useMemo(() => (totalPages == null ? true : page < totalPages), [page, totalPages]);

  const grouped = useMemo(() => {
    if (effectiveCategory) return {};
    const map: Record<string, Problem[]> = {};
    const known = new Set(categories);
    for (const p of problems) {
      const cats = (p.categories && p.categories.length ? p.categories : ['All']);
      for (const c of cats) {
        const key = known.has(c) ? c : c || 'All';
        if (!map[key]) map[key] = [];
        map[key].push(p);
      }
    }
    const ordered: Record<string, Problem[]> = {};
    [...categories, 'Uncategorized'].forEach((k) => {
      if (map[k]?.length) ordered[k] = map[k];
    });
    Object.keys(map).forEach((k) => {
      if (!ordered[k]) ordered[k] = map[k];
    });
    return ordered;
  }, [problems, effectiveCategory, categories]);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Problems</h1>
      </div>

      {/* Category chips bar */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('');
              const sp = new URLSearchParams(location.search);
              sp.delete('cat');
              navigate({ pathname: location.pathname, search: sp.toString() }, { replace: true });
            }}
            className={
              'px-3 py-1 rounded border text-sm transition ' +
              (!effectiveCategory
                ? 'border-yellow-500 bg-yellow-500 text-black'
                : 'border-neutral-800 bg-neutral-900 hover:border-yellow-400 hover:text-yellow-400')
            }
          >
            All
          </button>

          {categories.map((c) => {
            const active = effectiveCategory === c;
            return (
              <button
                type="button"
                key={c}
                onClick={() => {
                  const next = active ? '' : c;
                  setSelectedCategory(next);
                  const sp = new URLSearchParams(location.search);
                  if (next) sp.set('cat', next);
                  else sp.delete('cat');
                  navigate({ pathname: location.pathname, search: sp.toString() }, { replace: true });
                }}
                className={
                  'px-3 py-1 rounded border text-sm transition ' +
                  (active
                    ? 'border-yellow-500 bg-yellow-500 text-black'
                    : 'border-neutral-800 bg-neutral-900 hover:border-yellow-400 hover:text-yellow-400')
                }
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-end gap-4 mb-3">
        <div className="flex-1">
          <label className="block text-sm mb-1">Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Problem name or category"
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
        effectiveCategory ? (
          problems.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {problems.map((p) => {
                const isNew = justCreatedId === p.id;
                return (
                  <ProblemCard
                    key={p.id}
                    ref={isNew ? newCardRef : null}
                    problem={p}
                    isNew={isNew}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-neutral-400">No problems found.</div>
          )
        ) : (
          Object.keys(grouped).length ? (
            <div className="space-y-8">
              {Object.entries(grouped).map(([cat, items]) => (
                <section key={cat}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">{cat}</h2>
                    <button
                      onClick={() => {
                        setSelectedCategory(cat);
                        const sp = new URLSearchParams(location.search);
                        sp.set('cat', cat);
                        navigate({ pathname: location.pathname, search: sp.toString() }, { replace: true });
                      }}
                      className="text-xs px-2 py-1 rounded border border-neutral-1000 hover:border-yellow-400 hover:text-yellow-400 transition"
                    >
                      View only this category
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {items.map((p) => {
                      const isNew = justCreatedId === p.id;
                      return (
                        <ProblemCard
                          key={p.id}
                          ref={isNew ? newCardRef : null}
                          problem={p}
                          isNew={isNew}
                        />
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="text-neutral-400">No problems found.</div>
          )
        )
      )}

      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          disabled={!canPrev}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="text-xs px-2 py-1 rounded border border-neutral-1000 hover:border-yellow-400 hover:text-yellow-400 transition"
        >
          Prev
        </button>
        <span className="text-sm">Page {page}{totalPages ? ` / ${totalPages}` : ''}</span>
        <button
          disabled={!canNext}
          onClick={() => setPage((p) => p + 1)}
          className="text-xs px-2 py-1 rounded border border-neutral-1000 hover:border-yellow-400 hover:text-yellow-400 transition"
        >
          Next
        </button>
      </div>
    </AppLayout>
  );
}
