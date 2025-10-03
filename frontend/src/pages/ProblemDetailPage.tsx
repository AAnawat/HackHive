import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Xterm from '../components/xterm';
import { getProblem, voteProblem, submitFlag } from '../api/client';
import type { Problem } from '../types';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProblemDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { token } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);
  
  // Flag submission
  const [flagInput, setFlagInput] = useState('');
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [flagResult, setFlagResult] = useState<{ correct: boolean; message: string; score?: number } | null>(null);
  
  // Terminal toggle
  const [terminalOpen, setTerminalOpen] = useState(false);

  useEffect(() => {
    if (!id || Number.isNaN(id)) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProblem(id)
      .then((data: any) => { if (!cancelled) setProblem(data as Problem); })
      .catch((e) => { if (!cancelled) setError(e.message || 'Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  async function handleLike(isLiked: boolean) {
    if (!token) {
      setLikeError('You must be logged in to vote');
      return;
    }
    setLikeLoading(true);
    setLikeError(null);
    try {
      await voteProblem(id, isLiked, token);
      setProblem((prev) => prev ? { ...prev, like: (prev.like ?? 0) + (isLiked ? 1 : -1) } : prev);
    } catch (e: any) {
      setLikeError(e.message || 'Failed to vote');
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleSubmitFlag(e: React.FormEvent) {
    e.preventDefault();
    if (!flagInput.trim() || !token) return;
    
    setFlagSubmitting(true);
    setFlagResult(null);
    try {
      const result = await submitFlag(id, flagInput.trim(), token);
      setFlagResult(result);
      if (result.correct) {
        setFlagInput('');
      }
    } catch (e: any) {
      setFlagResult({ correct: false, message: e.message || 'Submission failed' });
    } finally {
      setFlagSubmitting(false);
    }
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}
        {!loading && !error && problem && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{problem.problem}</h1>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                    'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-neutral-400">
                  <span>🎯 {problem.score} points</span>
                  <span>❤️ {problem.like ?? 0} likes</span>
                </div>
              </div>
              <button 
                onClick={() => setTerminalOpen(!terminalOpen)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all inline-flex items-center gap-2 ${
                  terminalOpen 
                    ? 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white' 
                    : 'bg-yellow-500 text-black hover:bg-yellow-400'
                }`}
              >
                💻 {terminalOpen ? 'Hide Terminal' : 'Open Terminal'}
              </button>
            </div>

            {/* Terminal Section */}
            {terminalOpen && (
              <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-sm text-neutral-400 ml-2">Terminal</span>
                  </div>
                  <button 
                    onClick={() => setTerminalOpen(false)}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div style={{ height: '400px' }}>
                  <Xterm host="http://localhost:1234" />
                </div>
              </div>
            )}

            {/* Main Content Grid */}
            <div className={`grid gap-6 ${terminalOpen ? 'lg:grid-cols-2' : ''}`}>
              {/* Left Column - Problem Info */}
              <div className="space-y-6">{/* Description */}
            <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-neutral-300 leading-relaxed">{problem.description || 'No description available'}</p>
            </div>

            {/* Categories */}
            {!!(problem.categories?.length) && (
              <div className="flex gap-2 flex-wrap">
                {problem.categories!.map((c) => (
                  <span key={c} className="text-sm px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
                    {c}
                  </span>
                ))}
              </div>
            )}

            {/* Hints */}
            {!!(problem.hints?.length) && (
              <div className="bg-yellow-500/5 rounded-lg p-6 border border-yellow-500/20">
                <h3 className="font-semibold mb-3 text-yellow-300 flex items-center gap-2">
                  💡 Hints
                </h3>
                <ul className="space-y-2 text-neutral-300">
                  {problem.hints!.map((h, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}</div>

              {/* Right Column - Actions */}
              <div className="space-y-6">{/* Flag Submission */}
            <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                🚩 Submit Flag
              </h3>
              <form onSubmit={handleSubmitFlag} className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={flagInput}
                    onChange={(e) => setFlagInput(e.target.value)}
                    placeholder="CTF{your_flag_here}"
                    className="flex-1 px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-yellow-500 focus:outline-none"
                    disabled={flagSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={flagSubmitting || !flagInput.trim()}
                    className="px-6 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {flagSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
                
                {flagResult && (
                  <div className={`p-4 rounded-lg border ${
                    flagResult.correct 
                      ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    <div className="flex items-center gap-2 font-semibold mb-1">
                      {flagResult.correct ? '✅ Correct!' : '❌ Incorrect'}
                    </div>
                    <div className="text-sm">{flagResult.message}</div>
                    {flagResult.score && (
                      <div className="text-sm mt-2">You earned <strong>{flagResult.score} points</strong>!</div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Like/Unlike */}
            <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
              <h3 className="font-semibold mb-4">Feedback</h3>
              <div className="flex items-center gap-3">
              <button 
                disabled={likeLoading} 
                onClick={() => handleLike(true)} 
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 disabled:opacity-50 transition-all"
              >
                👍 Like
              </button>
              <button 
                disabled={likeLoading} 
                onClick={() => handleLike(false)} 
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 disabled:opacity-50 transition-all"
              >
                👎 Unlike
              </button>
              {likeError && <span className="text-sm text-red-400">{likeError}</span>}
            </div>
            </div></div>
            </div>

          </div>
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}


