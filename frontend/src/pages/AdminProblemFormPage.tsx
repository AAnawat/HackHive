import { useState } from 'react';
import type { FormEvent } from 'react';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';

// This page relies on backend admin token via Authorization header 'Bearer <ADMIN_TOKEN>'
// The simplest method: admin pastes token into a field for this session.

export default function AdminProblemFormPage() {
  const { token } = useAuth();
  const [adminToken, setAdminToken] = useState('');
  const [problem, setProblem] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [score, setScore] = useState<number>(100);
  const [categories, setCategories] = useState<string>('');
  const [hints, setHints] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const payload: any = {
        problem,
        description,
        difficulty,
        score,
      };
      const cats = categories.split(',').map((c) => c.trim()).filter(Boolean);
      if (cats.length) payload.categories = cats;
      const hintArr = hints.split('\n').map((h) => h.trim()).filter(Boolean);
      if (hintArr.length) payload.hints = hintArr;

      const authHeader = adminToken || token || '';
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authHeader}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Create failed');
      setMessage('Problem created');
      setProblem('');
      setDescription('');
      setCategories('');
      setHints('');
      setDifficulty('Easy');
      setScore(100);
    } catch (e: any) {
      setError(e.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-lg">
        <h1 className="text-2xl font-semibold mb-4">Admin: Create Problem</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Admin Token (Bearer payload)</label>
            <input value={adminToken} onChange={(e) => setAdminToken(e.target.value)} placeholder="Paste ADMIN_TOKEN (optional if injected)" className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800" />
          </div>
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input value={problem} onChange={(e) => setProblem(e.target.value)} required className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800" />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800" />
          </div>
          <div className="flex gap-3">
            <div>
              <label className="block text-sm mb-1">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="px-3 py-2 rounded bg-neutral-900 border border-neutral-800">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Score</label>
              <input type="number" value={score} onChange={(e) => setScore(parseInt(e.target.value) || 0)} className="w-28 px-3 py-2 rounded bg-neutral-900 border border-neutral-800" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Categories (comma separated)</label>
            <input value={categories} onChange={(e) => setCategories(e.target.value)} className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800" />
          </div>
          <div>
            <label className="block text-sm mb-1">Hints (one per line)</label>
            <textarea value={hints} onChange={(e) => setHints(e.target.value)} rows={4} className="w-full px-3 py-2 rounded bg-neutral-900 border border-neutral-800" />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {message && <div className="text-green-400 text-sm">{message}</div>}
          <button disabled={loading} className="px-4 py-2 rounded bg-yellow-500 text-black font-medium disabled:opacity-50">{loading ? 'Creating...' : 'Create Problem'}</button>
        </form>
      </div>
    </AppLayout>
  );
}


