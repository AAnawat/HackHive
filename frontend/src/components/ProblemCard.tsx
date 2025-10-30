import { Link } from 'react-router-dom';
import type { Problem } from '../types';
import { forwardRef, useEffect, useState } from 'react';

type Props = {
  problem: Problem;
  isNew?: boolean;
};

const ProblemCard = forwardRef<HTMLAnchorElement, Props>(({ problem, isNew }, ref) => {
  const title = problem.problem || '(untitled)';
  const desc = problem.description || '';

  const initialLikes = typeof (problem as any).likes === 'number' ? (problem as any).likes : 0;

  const score = typeof problem.score === 'number' ? problem.score : 0;
  const difficulty = problem.difficulty || 'Unknown';

  const [likeCount, setLikeCount] = useState<number>(initialLikes);

  useEffect(() => {
    setLikeCount(initialLikes);
  }, [initialLikes, problem.id]);

  useEffect(() => {
    function onVoted(e: Event) {
      const ce = e as CustomEvent<{ problemId: number; delta: number }>;
      if (!ce.detail) return;
      if (Number(ce.detail.problemId) === Number(problem.id)) {
        setLikeCount((prev) => Math.max(0, prev + (ce.detail.delta || 0)));
      }
    }
    window.addEventListener('problem:voted', onVoted);
    return () => window.removeEventListener('problem:voted', onVoted);
  }, [problem.id]);

  const categories: string[] = Array.isArray((problem as any).categories)
    ? ((problem as any).categories as string[])
    : ((problem as any).category ? [String((problem as any).category)] : []);

  // สีระดับความยาก
  const difficultyColor =
    difficulty.toLowerCase() === 'easy'
      ? 'bg-green-700 text-green-200'
      : difficulty.toLowerCase() === 'medium'
      ? 'bg-yellow-600 text-yellow-100'
      : difficulty.toLowerCase() === 'hard'
      ? 'bg-red-700 text-red-200'
      : 'bg-neutral-700 text-neutral-200';

  return (
    <Link
      ref={ref}
      to={`/problems/${problem.id}`}
      className={`block rounded p-4 border border-neutral-800 hover:border-yellow-500 transition
        ${isNew ? 'border-yellow-500 ring-2 ring-yellow-500' : ''}
        bg-neutral-900 hover:bg-neutral-800`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
        <span className={`text-xs px-2 py-1 rounded font-medium ${difficultyColor}`}>
          {difficulty}
        </span>
      </div>

      <p className="text-neutral-300 mt-2 line-clamp-3">{desc}</p>

      {/* หมวดหมู่โจทย์ */}
      {categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c}
              className="text-xs px-2 py-1 rounded border border-yellow-600 bg-yellow-900/40 text-yellow-300 font-medium hover:bg-yellow-800/60 transition"
              title={c}
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {/* แถบคะแนน / ไลก์ */}
      <div className="mt-3 text-sm text-neutral-200 flex items-center justify-between font-medium">
        <span>
          🍯 Score: <span className="text-yellow-400">{score}</span>
        </span>
        <span>
          🐝 Likes: <span className="text-green-400">{likeCount} %</span>
        </span>
      </div>
    </Link>
  );
});

export default ProblemCard;
