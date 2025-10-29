import type { User } from '../types';

interface ScoreSectionProps {
  user: User | null;
  loading?: boolean;
}

export default function ScoreSection({ user, loading = false }: ScoreSectionProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur px-5 sm:px-6 py-6 sm:py-8 shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-800 rounded w-20 mb-3"></div>
          <div className="h-8 bg-neutral-800 rounded w-16"></div>
        </div>
      </div>
    );
  }

  const score = user?.score ?? 0;
  const hasScore = user?.score !== null && user?.score !== undefined;

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur px-5 sm:px-6 py-6 sm:py-8 shadow-lg">
      <div className="text-center">
        <h3 className="text-sm font-semibold text-neutral-300 mb-3">Total Score</h3>
        <div className="flex items-center justify-center">
          <span className="text-3xl sm:text-4xl font-bold text-yellow-500">
            {score.toLocaleString()}
          </span>
        </div>
        {!hasScore && (
          <p className="text-xs text-neutral-400 mt-2">
            Complete problems to earn your first points!
          </p>
        )}
      </div>
    </div>
  );
}