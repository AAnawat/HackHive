import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProblems, getLeaderboard  } from '../api/client';
import ProblemCard from '../components/ProblemCard';
import type { Problem, LeaderboardEntry } from '../types';

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

      // ⭐ Sort leaderboard by score DESC
      const sortedLB = Array.isArray(lb) 
        ? [...lb].sort((a, b) => b.score - a.score)
        : [];

      setLeaderboard(sortedLB);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        {/* Hero Section (refined) */}
<section className="relative overflow-hidden rounded-lg border border-yellow-500/20 p-6 md:p-12 bg-neutral-900/40">
  {/* Keyframes + accessibility */}
  <style>{`
    @keyframes matrix { 0%{transform:translateY(-10%)} 100%{transform:translateY(100%)} }
    @keyframes floatX { 0%{transform:translateX(0)} 50%{transform:translateX(6px)} 100%{transform:translateX(0)} }
    @keyframes glitch {
      0%{clip-path:inset(0);transform:translateX(0);opacity:1}
      20%{clip-path:inset(10% 0 60% 0);transform:translateX(-2px);opacity:.9}
      40%{clip-path:inset(50% 0 10% 0);transform:translateX(2px);opacity:.95}
      60%{clip-path:inset(20% 0 40% 0);transform:translateX(-1px);opacity:.98}
      100%{clip-path:inset(0);transform:translateX(0);opacity:1}
    }
    /* CRT scanline (very subtle) */
    .crt::after{
      content:"";position:absolute;inset:0;pointer-events:none;mix-blend:overlay;
      background-image: repeating-linear-gradient(
        to bottom, rgba(255,255,255,.04) 0, rgba(255,255,255,.04) 1px, transparent 2px, transparent 4px
      );
      opacity:.25
    }
    /* Reduced motion: turn off heavy animations */
    @media (prefers-reduced-motion: reduce) {
      .anim, .glitching { animation: none !important }
    }
  `}</style>

  {/* Background */}
  <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden crt">
    <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-[#020617] to-black opacity-80"></div>

    {/* Matrix rain - mobile (6 cols) */}
    <div className="absolute inset-0 flex md:hidden items-stretch space-x-2 opacity-30 will-change-transform">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={`m-${i}`} style={{
          flex: 1,
          transform: `translateY(${(i % 3) * -20}%)`,
          animation: `matrix ${9 + (i % 5)}s linear infinite`,
          animationDelay: `${(i % 4) * -0.7}s`
        }} className="anim">
          <div className="h-full text-[10px] leading-[10px] text-green-400/25 select-none pointer-events-none"
               style={{ writingMode: 'vertical-rl', whiteSpace: 'nowrap' }}>
            {Array.from({ length: 40 }).map((__, j) => (
              <div key={j} className="opacity-[0.6]">{['0','1','<','>','/',';','#','@','?'][(j + i) % 9]}</div>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Matrix rain - desktop (14 cols) */}
    <div className="absolute inset-0 hidden md:flex items-stretch space-x-2 opacity-30 will-change-transform">
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={`d-${i}`} style={{
          flex: 1,
          transform: `translateY(${(i % 3) * -20}%)`,
          animation: `matrix ${8 + (i % 5)}s linear infinite`,
          animationDelay: `${(i % 4) * -0.7}s`
        }} className="anim">
          <div className="h-full text-[10px] leading-[10px] text-green-400/25 select-none pointer-events-none"
               style={{ writingMode: 'vertical-rl', whiteSpace: 'nowrap' }}>
            {Array.from({ length: 46 }).map((__, j) => (
              <div key={j} className="opacity-[0.6]">{['0','1','<','>','/',';','#','@','?'][(j + i) % 9]}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Content */}
  <div className="relative z-10 max-w-4xl">
    <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold bg-yellow-500/12 text-yellow-300 rounded-full border border-yellow-500/20">
      🚀 Capture The Flag — Hack Hive
    </div>

    {/* Glitch title */}
    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 relative leading-tight">
      <span className="block bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500 text-transparent bg-clip-text glitching"
            style={{ animation: 'glitch 3.2s infinite ease-in-out' }}>
        Welcome to HackHive
      </span>
      <span aria-hidden className="absolute left-0 top-0 text-4xl md:text-5xl font-extrabold text-yellow-400/15 blur-sm transform -translate-x-[1px] -translate-y-[1px] pointer-events-none">Welcome to HackHive</span>
      <span aria-hidden className="absolute left-0 top-0 text-4xl md:text-5xl font-extrabold text-orange-400/10 mix-blend-screen transform translate-x-[1px] translate-y-[1px] pointer-events-none">Welcome to HackHive</span>
    </h1>

    <p className="text-lg text-neutral-300 mb-6 leading-relaxed max-w-2xl">
      Sharpen your cybersecurity skills with hands-on CTF challenges.
      Solve problems, capture flags, and climb the leaderboard.
      <span className="text-xl text-yellow-300">{user ? ` Welcome back, ${user.username}!` : ' Join the hive today.' }</span>
    </p>

    <div className="flex flex-wrap gap-3 items-center">
      <Link
        to="/problems"
        className="px-6 py-3 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/25 anim"
        style={{ animation: 'floatX 3s cubic-bezier(.2,.9,.3,1) infinite' }}
        aria-label="Browse Challenges"
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

      {/* mini terminal bubble (typing) */}
      <div className="ml-2 rounded-md bg-neutral-900/60 border border-neutral-800 px-3 pr-12 py-2 text-sm text-green-300 font-mono shadow-inner overflow-hidden">
        <span className="opacity-60">$</span>
        <span className="ml-2 inline-block whitespace-nowrap anim" style={{ animation: 'typing 6s steps(30,end) infinite' }}>
          nmap -sC -sV hackhive.local
        </span>
        <style>{`
          @keyframes typing {
            0%{width:0} 40%{width:16ch} 70%{width:16ch;opacity:1} 100%{width:0;opacity:0}
          }
        `}</style>
      </div>
    </div>
  </div>

  {/* Floating snippet (fixed string) */}
  <div className="pointer-events-none absolute right-6 top-6 hidden lg:block">
    <div className="bg-[#071017]/80 border border-neutral-800 rounded-md p-3 text-xs text-green-300 font-mono shadow-md anim"
         style={{ transform: 'rotate(-6deg)', animation: 'floatX 5s ease-in-out infinite' }}>
      <div>const flag = "hack_the_hive";</div>
      <div>fetch('/api/flags')</div>
      <div>/* 0xdeadbeef */</div>
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
                icon="🍯"
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
                icon="🍯"
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
                <h3 className="font-semibold mb-3 text-yellow-300">Why Choose HackHive?</h3>
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
        <div>
          <div className="font-semibold text-white truncate"><img className="w-8 h-8 rounded-full" src={entry.pfp_path} alt={entry.username}/></div>
        </div>
        <div>
          <div className="font-semibold text-white truncate">{entry.username}</div>
        </div>
        <div className="text-right flex-1 min-w-0">
          <div className="font-bold text-yellow-400">{entry.score}</div>
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