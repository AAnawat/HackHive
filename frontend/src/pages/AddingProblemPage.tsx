import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { createProblem, type CreateProblemInput, getProblemCategories } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AddingProblemPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  // ฟอร์มหลัก
  const [problem, setProblem] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [score, setScore] = useState<number>(100);
  const [hints, setHints] = useState('');

  // Categories
  const fallbackCategories = [
    'Web Security',
    'Reverse Engineering',
    'Cryptography',
    'Binary Exploitation',
    'Forensics',
  ];
  const [allCategories, setAllCategories] = useState<string[]>(fallbackCategories);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // ดึงจาก backend ถ้ามี
  useEffect(() => {
    let cancelled = false;
    getProblemCategories()
      .then((res) => {
        if (!cancelled && res?.categories?.length) {
          setAllCategories(res.categories);
        }
      })
      .catch(() => setAllCategories(fallbackCategories));
    return () => {
      cancelled = true;
    };
  }, []);

  // toggle หมวดหมู่
  function toggleCategory(name: string) {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  // submit
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (!token) {
        setError('ต้องล็อกอินก่อนถึงจะสร้างโจทย์ได้');
        setLoading(false);
        return;
      }

      const payload: CreateProblemInput = {
        problem,
        description: description || undefined,
        difficulty,
        score,
        categories: selectedCategories,
        hints: hints.split('\n').map((s) => s.trim()).filter(Boolean),
      };

      const data: any = await createProblem(payload, token);
      const created = data?.id ? data : data?.problem || data;
      const newId = created?.id;

      setMessage('Problem created successfully 🎉');
      setProblem('');
      setDescription('');
      setHints('');
      setDifficulty('Easy');
      setScore(100);
      setSelectedCategories([]);

      if (newId) navigate(`/problems?new=${newId}`, { state: { justCreated: created } });
      else navigate('/problems');
    } catch (e: any) {
      setError(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="w-full max-w-xl mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-6 text-center">Create Problem</h1>

        {!token && (
          <div className="text-xs text-red-400 mb-4 text-center">
            โปรดล็อกอินก่อน (หน้า /login หรือจุดที่คุณทำไว้) เพื่อรับสิทธิ์สร้างโจทย์
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              required
              className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800"
            />
          </div>

          {/* Difficulty & Score */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="w-40">
              <label className="block text-sm mb-1">Score</label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800"
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((c) => {
                const active = selectedCategories.includes(c);
                return (
                  <button
                    type="button"
                    key={c}
                    onClick={() => toggleCategory(c)}
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
            {!!selectedCategories.length && (
              <div className="text-xs text-neutral-400 mt-2">
                Selected: {selectedCategories.join(', ')}
              </div>
            )}
          </div>

          {/* Hints */}
          <div>
            <label className="block text-sm mb-1">Hints (one per line)</label>
            <textarea
              value={hints}
              onChange={(e) => setHints(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800"
            />
          </div>

          {/* Error / Success */}
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {message && <div className="text-green-400 text-sm">{message}</div>}

          {/* Submit button */}
          <div className="flex justify-center">
            <button
              disabled={loading}
              className="px-5 py-2 rounded bg-yellow-500 text-black font-medium disabled:opacity-50
                         transition-transform transition-colors duration-150
                         hover:bg-yellow-400 hover:-translate-y-0.5 hover:shadow-lg"
            >
              {loading ? 'Creating...' : 'Create Problem'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
