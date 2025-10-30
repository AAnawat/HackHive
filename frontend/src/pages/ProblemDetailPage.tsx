import { useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Xterm from '../components/xterm';
import { getProblem, voteProblem, submitFlag, getSession, launchSession, getSessionStatus, stopSession } from '../api/client';
import type { Problem, SessionStatus, SessionItem } from '../types';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type vote = 'like' | 'dislike' | null;

export default function ProblemDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const problemId = Number(params.id);
  const { token, user } = useAuth();

  // Problem detail
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vote
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [voteDone, setVoteDone] = useState<boolean>(false);
  const [voteChoice, setVoteChoice] = useState<vote>(null);

  // Hints toggle
  const [showHints, setShowHints] = useState(false);

  // Flag submission
  const [flagInput, setFlagInput] = useState('');
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [flagResult, setFlagResult] = useState<{ correct: boolean; message: string; score?: number } | null>(null);
  const [problemSolved, setProblemSolved] = useState(false);

  // Terminal toggle
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [ip, setIP] = useState<string | null>(null);

  // Session control
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('Unknown');
  const [launching, setLaunching] = useState(false);
  const pollTimerRef = useRef<number | null>(null);

  const statusToClasses = (status: SessionStatus | null | undefined, solved: boolean = false) => {
    if (solved) return 'bg-green-500 border-green-400';
    switch (status) {
      case 'Running':
        return 'bg-green-500 border-green-400';
      case 'Pending':
        return 'bg-yellow-500 border-yellow-400';
      default:
        return 'bg-neutral-500 border-neutral-400';
    }
  };
  const statusLabel = (status: SessionStatus, solved: boolean = false) => {
    if (solved) return 'Solved';
    return status === 'Unknown' ? 'Unknown' : status;
  };

  //Vote
  useEffect(() => {
    if (!problem || !user) return;

    const likedByMe = (problem as any)?.likedByMe;
    const dislikedByMe = (problem as any)?.dislikedByMe;

    if (likedByMe === true) {
      setVoteChoice('like');
    } else if (dislikedByMe === true) {
      setVoteChoice('dislike');
    } else {
      setVoteChoice(null);
    }
    setVoteDone(false);
  }, [problem, user]);

  async function vote(choice: 'like' | 'dislike') {
    if (!token || !user) {
      setLikeError('You must be logged in to vote');
      return;
    }
    setLikeLoading(true);
    setLikeError(null);
    try {
      await voteProblem(user.id, choice === 'like', token);

      const fresh = await getProblem(problemId);
      const normalized: Problem = {
        ...(fresh as Problem),
        like: Number((fresh as any).like ?? (fresh as any).likes ?? 0),
      };
      setProblem(normalized);

      setVoteChoice(choice);
      setVoteDone(false);
    } catch (e: any) {
      setLikeError(e?.message || 'Failed to vote');
    } finally {
      setLikeLoading(false);
    }
  }
  
  // โหลดรายละเอียดโจทย์
  useEffect(() => {
    if (!problemId || Number.isNaN(problemId)) {
      setError('Invalid problem id');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    getProblem(problemId)
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
  }, [problemId]);

  // หา session ที่ยังเปิดอยู่ แล้วเริ่ม polling
  useEffect(() => {
    if (!user || !token || !problemId) return;
    let cancelled = false;

    async function setupSession() {
      setSessionId(null);
      setSessionStatus('Unknown');
      setTerminalOpen(false);

      try {
        const open = await getOpenSessionStatus(problemId, user.id, token);
        if (cancelled) return;

        if (open && open.session && open.session.id && open.ip) {
          setSessionId(open.session.id);
          setTerminalOpen(open.status === 'Running');
          setIP(open.ip);
          startPolling(open.session.id);
        } else {
          setSessionId(null);
          setTerminalOpen(false);
        }
        setSessionStatus(open.status ?? 'Unknown');
        
      } catch (error) {
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
  }, [problemId, token, user]);

  // Polling helpers
  function startPolling(sid: string) {
    stopPolling();
    pollTimerRef.current = window.setInterval(() => pollOnce(sid), 5000);
    void pollOnce(sid);
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
      const status = result.status;
      setSessionStatus(status);
      setTerminalOpen(status === 'Running');
      if (result.ip_address) 
        setIP(result.ip_address);

      // Stop polling at terminal states
      if (status === undefined || ['Error', 'Terminated'].includes(status)) {
        stopPolling();
        if (status === 'Terminated') {
          setSessionId(null);
          setIP(null);
        }
      }
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
      const existing = await getOpenSessionStatus(problemId, user.id, token);
      if (existing && existing.session && existing.session.id) {
        setSessionId(existing.session.id);
        setSessionStatus(existing.status);
        setTerminalOpen(existing.status === 'Running');
        setIP(existing.ip);
        startPolling(existing.session.id);
        return;
      }

      const session = await launchSession(user.id, problemId, token);
      setSessionId(session.id);
      setSessionStatus(session.status);
      startPolling(session.id);
    } catch {
      setSessionStatus('Error');
    } finally {
      setLaunching(false);
    }
  }

  // Stop a session
  async function onStop() {
    if (!sessionId || !token) return;
    setLaunching(true);
    try {
      await stopSession(sessionId, token);
      setSessionStatus('Terminated');
      setTerminalOpen(false);
      stopPolling();
    } catch (error) {
      console.error('Failed to stop session:', error);
    } finally {
      setLaunching(false);
    }
  }

  async function handleSubmitFlag(e: React.FormEvent) {
    e.preventDefault();
    if (!flagInput.trim() || !token) return;

    setFlagSubmitting(true);
    setFlagResult(null);
    if (!sessionId) {
        setFlagResult({ correct: false, message: 'No active session. Please launch server first.' });
        setFlagSubmitting(false);
        return;
    }
    try {
      const result = await submitFlag(Number(sessionId), flagInput.trim(), token);
      setFlagResult(result);
      if (result.correct) {
        setFlagInput('');
        // When flag is correct: hide terminal, clear status, stop polling
        setTerminalOpen(false);
        setSessionStatus('Terminated');
        setSessionId(null);
        setIP(null);
        setProblemSolved(true);
        stopPolling();
      }
    } catch (e: any) {
      setFlagResult({ correct: false, message: e.message || 'Submission failed' });
    } finally {
      setFlagSubmitting(false);
    }
  }

  async function getOpenSessionStatus(
    problemId: number,
    userId: string | number,
    token?: string
  ): Promise<{ session: SessionItem; status: SessionStatus; ip: string } | null> {
    if (!token || !problemId || userId === undefined || userId === null) return null;

    const resp = await getSession(token);
    if (!resp) return null;

    // normalize fields to camelCase (compatible with SessionItem)
    const session: SessionItem = {
      id: resp.id,
      user_id: user.id,
      problem_id: problemId,
      status: resp.status,
    }

    if (session.status !== "Pending" && !resp.ip_address) {
      throw new Error('Session has no IP address');
    }

    const statusResp = await getSessionStatus(session.id, token);
    const status = statusResp.status ?? 'Unknown';

    return { session, status, ip: resp.ip_address };
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
                  <span className={`inline-block w-3 h-3 rounded-full border ${statusToClasses(sessionStatus, problemSolved)}`} />
                  <span className="text-sm text-neutral-300">{statusLabel(sessionStatus, problemSolved)}</span>
                  {sessionId && !problemSolved && <span className="text-xs text-neutral-500 ml-2">#{sessionId}</span>}
                </div>

                {/* Launch/Stop button */}
                {problemSolved ? (
                  <button
                    disabled={true}
                    className="px-4 py-2 rounded-lg font-semibold transition-all inline-flex items-center gap-2 bg-green-600 text-white cursor-not-allowed"
                    title="Problem solved! Great job!"
                  >
                    ✅ Problem Solved
                  </button>
                ) : sessionStatus === 'Pending' || sessionStatus === 'Running' || sessionStatus === 'Error' ? (
                  <button
                    onClick={onStop}
                    disabled={launching || sessionStatus === 'Pending'}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all inline-flex items-center gap-2 ${
                      launching || sessionStatus === 'Pending'
                        ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed' 
                        : 'bg-red-500 text-white hover:bg-red-400'
                    }`}
                    title={sessionStatus === 'Pending' ? 'Session is starting, please wait' : 'Stop the server session'}
                  >
                    🛑 {launching ? 'Stopping...' : sessionStatus === 'Pending' ? 'Starting...' : 'Stop Server'}
                  </button>
                ) : (
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
                )}

                {/* Terminal button */}
                <button
                  onClick={() => setTerminalOpen(!terminalOpen)}
                  disabled={sessionStatus !== 'Running'}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all inline-flex items-center gap-2 ${
                    sessionStatus !== 'Running'
                      ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed border border-neutral-700'
                      : terminalOpen
                      ? 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white'
                      : 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white'
                  }`}
                  title={sessionStatus !== 'Running' ? 'Terminal only available when server is running' : ''}
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
                  <Xterm host={`http://${ip}:1234`} />
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
                        placeholder={problemSolved ? "Problem already solved!" : "flag{your_flag_here}"}
                        className="flex-1 px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-yellow-500 focus:outline-none"
                        disabled={flagSubmitting || problemSolved}
                      />
                      <button
                        type="submit"
                        disabled={flagSubmitting || !flagInput.trim() || problemSolved}
                        className="px-6 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {problemSolved ? 'Solved' : flagSubmitting ? 'Submitting...' : 'Submit'}
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

                {/* Like / Dislike (one-shot, no undo) */}
                <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
                  <h3 className="font-semibold mb-4">Feedback</h3>
                  <div className="flex items-center gap-3">
                    <button
                      disabled={likeLoading}
                      onClick={() => vote('like')}
                      className={`px-4 py-2 rounded-lg border transition-all inline-flex items-center gap-2
                        ${likeLoading
                          ? 'bg-neutral-800 border-neutral-700 text-neutral-400 cursor-wait'
                          : voteChoice === 'like'
                            ? 'bg-green-600/20 border-green-600/40 text-green-300'
                            : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-white'
                        }`}
                      title="Like this problem"
                    >
                      👍 Like
                    </button>

                    <button
                      disabled={likeLoading}
                      onClick={() => vote('dislike')}
                      className={`px-4 py-2 rounded-lg border transition-all inline-flex items-center gap-2
                        ${likeLoading
                          ? 'bg-neutral-800 border-neutral-700 text-neutral-400 cursor-wait'
                          : voteChoice === 'dislike'
                            ? 'bg-red-600/20 border-red-600/40 text-red-300'
                            : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-white'
                        }`}
                      title="Dislike this problem"
                    >
                      👎 Dislike
                    </button>

                    {likeError && <span className="text-sm text-red-400">{likeError}</span>}
                  </div>
                  <p className="mt-3 text-sm text-neutral-400">สามารถโหวตให้กับโจทย์ได้</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}
