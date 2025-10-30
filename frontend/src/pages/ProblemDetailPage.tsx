import { useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Xterm from '../components/xterm';
import { getProblem, voteProblem, submitFlag, getSession, launchSession, getSessionStatus } from '../api/client';
import type { Problem, SessionStatus, SessionItem } from '../types';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProblemDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = Number(params.id);
  const { token, user } = useAuth();

  // Problem detail
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Like
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);

  // Hints toggle
  const [showHints, setShowHints] = useState(false);

  // Flag submission
  const [flagInput, setFlagInput] = useState('');
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [flagResult, setFlagResult] = useState<{ correct: boolean; message: string; score?: number } | null>(null);

  // Terminal toggle
  const [terminalOpen, setTerminalOpen] = useState(false);

  // Session control
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('Unknown');
  const [launching, setLaunching] = useState(false);
  const pollTimerRef = useRef<number | null>(null);

  const statusToClasses = (status: SessionStatus | null | undefined) => {
    switch (status) {
      case 'Running':
        return 'bg-green-500 border-green-400';
      case 'Pending':
        return 'bg-yellow-500 border-yellow-400';
      default:
        return 'bg-neutral-500 border-neutral-400';
    }
  };
  const statusLabel = (status: SessionStatus) => (status === 'Unknown' ? 'Unknown' : status);

  const canUnlike = useMemo(() => Math.max(0, problem?.like ?? 0) > 0, [problem?.like]);

  // Load problem detail
  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setError('Invalid problem id');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    getProblem(id)
      .then((data: any) => {
        if (cancelled) return;
        const normalized: Problem = {
          ...(data as Problem),
          like: Number((data as any).like ?? (data as any).likes ?? 0),
        };
        setProblem(normalized);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Find an open session (Running/Pending) for this problem+user and start polling
  useEffect(() => {
    if (!user || !token || !id) return;
    let cancelled = false;

    async function setupSession() {
      setSessionId(null);
      setSessionStatus('Unknown');
      setTerminalOpen(false);
      try {
        const open = await getOpenSessionStatus(id, user.id, token);
        if (cancelled) return;

        if (open && open.session && open.session.id) {
          setSessionId(open.session.id);
          setSessionStatus(open.status);
          setTerminalOpen(open.status === 'Running');
          startPolling(open.session.id);
        } else {
          setSessionId(null);
          setSessionStatus('Unknown');
          setTerminalOpen(false);
        }
      } catch {
        if (!cancelled) {
          setSessionStatus('Unknown');
          setTerminalOpen(false);
        }
      }
    }

    setupSession();
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [id, token, user]);

  // Polling helpers
  function startPolling(sid: string) {
    stopPolling(); // Only one poll at a time
    pollTimerRef.current = window.setInterval(() => pollOnce(sid), 5000);
    void pollOnce(sid); // one immediate
  }
  function stopPolling() {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }

  // Single status check
  async function pollOnce(sid: string) {
    if (!token) return;
    try {
      const result = await getSessionStatus(sid, token);
      const status = (result as any).status ?? 'Unknown';
      setSessionStatus(status);
      setTerminalOpen(status === 'Running');

      // Stop polling at terminal states
      if (['Stopped', 'Failed', 'Terminated'].includes(status)) stopPolling();
    } catch {
      setSessionStatus('Unknown');
      setTerminalOpen(false);
    }
  }

  // Launch a session (for this problem/user)
  async function onLaunch() {
    if (!user || !token) return;
    setLaunching(true);
    try {
      const existing = await getOpenSessionStatus(id, user.id, token);
      if (existing?.session?.id) {
        setSessionId(existing.session.id);
        setSessionStatus(existing.status);
        setTerminalOpen(existing.status === 'Running');
        startPolling(existing.session.id);
        return;
      }

      const session = await launchSession(String(user.id), String(id), token);
      setSessionId(session.id);
      setSessionStatus((session as any).status ?? 'Pending');
      startPolling(session.id);
    } catch {
      setSessionStatus('Unknown');
    } finally {
      setLaunching(false);
    }
  }

  async function handleLike(isLiked: boolean) {
    if (!token) {
      setLikeError('You must be logged in to vote');
      return;
    }
    setLikeLoading(true);
    setLikeError(null);
    try {
      await voteProblem(id, isLiked, token);
      setProblem((prev) =>
        prev ? { ...prev, like: Math.max(0, (prev.like ?? 0) + (isLiked ? 1 : -1)) } : prev
      );
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
    if (!id) {
        setFlagResult({ correct: false, message: 'No active session. Please launch server first.' });
        return;
    }
    try {
      const existing = await getOpenSessionStatus(id, user.id, token);
      const result = await submitFlag(Number(existing.session.id), flagInput.trim(), token);
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

  // ---- helper: find open session for this problem+user and get its live status
  async function getOpenSessionStatus(
    problemId: number,
    userId: string | number,
    token?: string
  ): Promise<{ session: SessionItem; status: SessionStatus } | null> {
    if (!token || !problemId || userId === undefined || userId === null) return null;

    const resp = await getSession(token);
    if (!Array.isArray(resp) || resp.length === 0) return null;

    // normalize fields to camelCase (compatible with SessionItem)
    const list: SessionItem[] = resp.map((s: any) => ({
      id: String(s.id ?? s.session_id ?? ''),
      user_id: s.userId ?? s.user_id,
      problem_id: Number(s.problemId ?? s.problem_id),
      status: (s.status ?? 'Unknown') as SessionStatus,
      // updatedAt: s.updatedAt ?? s.updated_at, // เผื่อจะใช้เรียงล่าสุดทีหลัง
    }));

    const matches = list.filter(
      (s) =>
        String(s.user_id) === String(userId) &&
        Number(s.problem_id) === Number(problemId) &&
        ['Running', 'Pending'].includes(s.status ?? 'Unknown')
    );
    if (matches.length === 0) return null;

    const pick = matches[0];
    if (!pick?.id) return null;

    const statusResp = await getSessionStatus(pick.id, token);
    const status = (statusResp as any)?.status ?? 'Unknown';

    return { session: pick, status };
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        {/* Top utility bar (Back) */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 rounded border border-neutral-1000 hover:border-yellow-400 hover:text-yellow-400 transition text-sm"
          >
            ← Back to Problems
          </button>
        </div>

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
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      problem.difficulty === 'Easy'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                        : problem.difficulty === 'Medium'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-neutral-400">
                  <span>🍯 {problem.score} points</span>
                  <span>🐝 Likes {problem.like ?? 0} %</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Status pill */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-900">
                  <span className={`inline-block w-3 h-3 rounded-full border ${statusToClasses(sessionStatus)}`} />
                  <span className="text-sm text-neutral-300">{statusLabel(sessionStatus)}</span>
                  {sessionId && <span className="text-xs text-neutral-500 ml-2">#{sessionId.slice(0, 8)}</span>}
                </div>

                {/* Launch button */}
                <button
                  onClick={onLaunch}
                  disabled={launching}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all inline-flex items-center gap-2 ${
                    launching ? 'bg-neutral-800 text-neutral-400 cursor-wait' : 'bg-yellow-500 text-black hover:bg-yellow-400'
                  }`}
                  title="Start a server session"
                >
                  🚀 {launching ? 'Launching...' : 'Launch Server'}
                </button>

                {/* Terminal button */}
                <button
                  onClick={() => setTerminalOpen(!terminalOpen)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all inline-flex items-center gap-2 ${
                    terminalOpen
                      ? 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white'
                      : 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white'
                  }`}
                >
                  💻 {terminalOpen ? 'Hide Terminal' : 'Open Terminal'}
                </button>
              </div>
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
                  <button onClick={() => setTerminalOpen(false)} className="text-neutral-400 hover:text-white transition-colors">
                    ✕
                  </button>
                </div>
                <div style={{ height: '400px' }}>
                  <Xterm host="http://54.87.224.163:1234" />
                </div>
              </div>
            )}

            {/* Main Content Grid */}
            <div className={`grid gap-6 ${terminalOpen ? 'lg:grid-cols-2' : ''}`}>
              {/* Left Column - Problem Info */}
              <div className="space-y-6">
                {/* Description */}
                <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
                  <h2 className="text-lg font-semibold mb-3">Description</h2>
                  <p className="text-neutral-300 leading-relaxed">
                    {problem.description || 'No description available'}
                  </p>
                </div>

                {/* Categories */}
                {!!problem.categories?.length && (
                  <div className="flex gap-2 flex-wrap">
                    {problem.categories!.map((c) => (
                      <span
                        key={c}
                        className="text-sm px-3 py-1 rounded-full border border-yellow-600 bg-yellow-900/40 text-yellow-300 font-medium hover:bg-yellow-800/60 transition"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Hints */}
                {!!problem.hints?.length && (
                  <div className="bg-yellow-500/5 rounded-lg p-3 border border-yellow-500/20">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-yellow-300 flex items-center gap-2">💡 Hints</h3>
                      <button
                        onClick={() => setShowHints(!showHints)}
                        className="text-sm px-3 py-1 rounded-md border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10 transition-all"
                      >
                        {showHints ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    {showHints && (
                      <ul className="space-y-2 text-neutral-300 animate-fadeIn">
                        {problem.hints!.map((h, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-yellow-500 mt-0.5">•</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column - Actions */}
              <div className="space-y-6">
                {/* Flag Submission */}
                <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">🚩 Submit Flag</h3>
                  <form onSubmit={handleSubmitFlag} className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={flagInput}
                        onChange={(e) => setFlagInput(e.target.value)}
                        placeholder="flag{your_flag_here}"
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
                      <div
                        className={`p-4 rounded-lg border ${
                          flagResult.correct
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-semibold mb-1">
                          {flagResult.correct ? '✅ Correct!' : '❌ Incorrect'}
                        </div>
                        <div className="text-sm">{flagResult.message}</div>
                        {flagResult.score && (
                          <div className="text-sm mt-2">
                            You earned <strong>{flagResult.score} points</strong>!
                          </div>
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
                      disabled={likeLoading || !canUnlike}
                      onClick={() => handleLike(false)}
                      className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 disabled:opacity-50 transition-all"
                      title={canUnlike ? '' : 'Cannot unlike below 0'}
                    >
                      👎 Unlike
                    </button>
                    {likeError && <span className="text-sm text-red-400">{likeError}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}
