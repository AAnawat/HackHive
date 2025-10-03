import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProblems, getLeaderboard, type LeaderboardEntry } from '../api/client';
import type { Problem } from '../types';

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0 });
  const [featuredProblems, setFeaturedProblems] = useState<Problem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProblems({ perPage: 100, page: 1 }),
      getProblems({ perPage: 3, page: 1 }),
      getLeaderboard(5)
    ]).then(([allProblems, featured, lb]: [any, any, any]) => {
      const all = Array.isArray(allProblems) ? allProblems : [];
      setStats({
        total: all.length,
        easy: all.filter((p: Problem) => p.difficulty === 'Easy').length,
        medium: all.filter((p: Problem) => p.difficulty === 'Medium').length,
        hard: all.filter((p: Problem) => p.difficulty === 'Hard').length,
      });
      setFeaturedProblems(Array.isArray(featured) ? featured : []);
      setLeaderboard(Array.isArray(lb) ? lb : []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-lg bg-gradient-to-br from-yellow-500/10 via-neutral-900 to-neutral-950 border border-yellow-500/20 p-8 md:p-12">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
              🚀 Capture The Flag Platform
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500 text-transparent bg-clip-text">
              Welcome to HackHive
            </h1>
            <p className="text-lg text-neutral-300 mb-8 leading-relaxed">
              Sharpen your cybersecurity skills with hands-on CTF challenges. 
              Solve problems, capture flags, and climb the leaderboard. 
              {user ? ` Welcome back, ${user.username}!` : ' Join the hive today.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link 
                to="/problems" 
                className="px-6 py-3 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/25"
              >
                Browse Challenges
              </Link>
              {!user && (
                <Link 
                  to="/register" 
                  className="px-6 py-3 rounded-lg border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 transition-all font-semibold"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Stats Dashboard */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-yellow-500">📊</span>
            Platform Statistics
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-neutral-900 rounded-lg p-6 border border-neutral-800 animate-pulse">
                  <div className="h-4 bg-neutral-800 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-neutral-800 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                label="Total Challenges" 
                value={stats.total} 
                icon="🎯"
                color="yellow"
              />
              <StatCard 
                label="Easy" 
                value={stats.easy} 
                icon="🟢"
                color="green"
              />
              <StatCard 
                label="Medium" 
                value={stats.medium} 
                icon="🟡"
                color="yellow"
              />
              <StatCard 
                label="Hard" 
                value={stats.hard} 
                icon="🔴"
                color="red"
              />
            </div>
          )}
        </section>

        {/* Featured Challenges */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-yellow-500">⭐</span>
              Featured Challenges
            </h2>
            <Link to="/problems" className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-neutral-900 rounded-lg p-6 border border-neutral-800 animate-pulse">
                  <div className="h-6 bg-neutral-800 rounded w-32 mb-3"></div>
                  <div className="h-4 bg-neutral-800 rounded w-full mb-2"></div>
                  <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : featuredProblems.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {featuredProblems.map(problem => (
                <ProblemCard key={problem.id} problem={problem} />
              ))}
            </div>
          ) : (
            <div className="bg-neutral-900 rounded-lg p-8 border border-neutral-800 text-center">
              <p className="text-neutral-400">No challenges available yet. Check back soon!</p>
            </div>
          )}
        </section>

        {/* Leaderboard Preview & Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-yellow-500">🏆</span>
                Top Hackers
              </h2>
              <Link to="/problems" className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
                Full Leaderboard →
              </Link>
            </div>
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
              {loading ? (
                <div className="divide-y divide-neutral-800">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="p-4 animate-pulse flex items-center gap-3">
                      <div className="w-8 h-8 bg-neutral-800 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-neutral-800 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-neutral-800 rounded w-32"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="divide-y divide-neutral-800">
                  {leaderboard.map((entry, idx) => (
                    <LeaderboardRow key={entry.id} entry={entry} rank={idx + 1} />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-neutral-400">
                  No rankings yet. Be the first to solve a challenge!
                </div>
              )}
            </div>
          </section>

          {/* Quick Actions & Info */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-yellow-500">⚡</span>
              Quick Start
            </h2>
            <div className="space-y-4">
              <QuickActionCard
                icon="🎯"
                title="Browse Challenges"
                description="Explore CTF problems across multiple categories and difficulty levels"
                link="/problems"
              />
              {user ? (
                <QuickActionCard
                  icon="👤"
                  title="View Profile"
                  description="Check your progress, solved problems, and statistics"
                  link="/profile"
                />
              ) : (
                <QuickActionCard
                  icon="🚀"
                  title="Create Account"
                  description="Join HackHive and start your cybersecurity journey today"
                  link="/register"
                />
              )}
              
              {/* Platform Info */}
              <div className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 rounded-lg p-6 border border-yellow-500/20">
                <h3 className="font-semibold mb-3 text-yellow-300">Why HackHive?</h3>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">✓</span>
                    <span>Real-world cybersecurity scenarios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">✓</span>
                    <span>Hands-on learning with immediate feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">✓</span>
                    <span>Competitive leaderboard and scoring system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">✓</span>
                    <span>Integrated terminal in problem pages</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

// Stat Card Component
function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const colors = {
    yellow: 'border-yellow-500/20 bg-yellow-500/5',
    green: 'border-green-500/20 bg-green-500/5',
    red: 'border-red-500/20 bg-red-500/5',
  };

  return (
    <div className={`rounded-lg p-6 border ${colors[color as keyof typeof colors] || colors.yellow} bg-neutral-900 hover:scale-105 transition-transform`}>
      <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

// Problem Card Component
function ProblemCard({ problem }: { problem: Problem }) {
  const difficultyColors = {
    Easy: 'bg-green-500/10 text-green-400 border-green-500/30',
    Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    Hard: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  return (
    <Link 
      to={`/problems/${problem.id}`}
      className="block bg-neutral-900 rounded-lg p-6 border border-neutral-800 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/10 group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg group-hover:text-yellow-400 transition-colors">
          {problem.problem}
        </h3>
        <span className={`text-xs px-2 py-1 rounded border ${difficultyColors[problem.difficulty]}`}>
          {problem.difficulty}
        </span>
      </div>
      <p className="text-sm text-neutral-400 mb-4 line-clamp-2">
        {problem.description || 'No description available'}
      </p>
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>🎯 {problem.score} pts</span>
        <span>❤️ {problem.like ?? 0} likes</span>
      </div>
    </Link>
  );
}

// Leaderboard Row Component
function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const medals = ['🥇', '🥈', '🥉'];
  const medal = rank <= 3 ? medals[rank - 1] : null;

  return (
    <div className="p-4 hover:bg-neutral-800/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 flex items-center justify-center font-bold text-lg">
          {medal || `#${rank}`}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white truncate">{entry.username}</div>
          <div className="text-xs text-neutral-400">
            {entry.problemsSolved} problems solved
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-yellow-400">{entry.totalScore}</div>
          <div className="text-xs text-neutral-500">points</div>
        </div>
      </div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ icon, title, description, link }: { icon: string; title: string; description: string; link: string }) {
  return (
    <Link 
      to={link}
      className="block bg-neutral-900 rounded-lg p-6 border border-neutral-800 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/10 group"
    >
      <div className="flex gap-4">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1 group-hover:text-yellow-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-neutral-400">{description}</p>
        </div>
        <div className="text-neutral-600 group-hover:text-yellow-500 transition-colors">
          →
        </div>
      </div>
    </Link>
  );
}