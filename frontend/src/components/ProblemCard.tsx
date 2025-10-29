import { Link } from 'react-router-dom';
import type { Problem } from '../types';
import { forwardRef } from 'react';

type Props = {
  problem: Problem;
  isNew?: boolean;
};

const ProblemCard = forwardRef<HTMLAnchorElement, Props>(({ problem, isNew }, ref) => {
  const title = problem.problem || '(untitled)';
  const desc = problem.description || '';
  const likes = typeof (problem as any).like === 'number' ? (problem as any).like : 0;
  const score = typeof problem.score === 'number' ? problem.score : 0;
  const difficulty = problem.difficulty || 'Unknown';

  // รองรับทั้ง `categories: string[]` และ `category: string`
  const categories: string[] = Array.isArray((problem as any).categories)
    ? (problem as any).categories as string[]
    : ((problem as any).category ? [String((problem as any).category)] : []);

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
        <span
          className={`text-xs font-bold px-2 py-1 rounded capitalize text-gray-300 ${
            difficulty === "Easy"
              ? "bg-green-600"
              : difficulty === "Medium"
              ? "bg-yellow-600 text-black"
              : difficulty === "Hard"
              ? "bg-red-600"
              : "bg-neutral-800"
          }`}
        >
          {difficulty}
        </span>
      </div>

      <p className="text-neutral-300 mt-2 line-clamp-3">
        {desc}
      </p>

      {/* แสดงหมวดของโจทย์ */}
      {categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c}
              className="text-xs px-2 py-1 rounded border border-neutral-800 text-neutral-300"
              title={c}
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {/* แถบคะแนน/ไลก์เล็กๆ ด้านล่าง */}
      <div className="mt-3 text-xs text-neutral-400">
        Score: {score} · Likes: {likes}
      </div>
    </Link>
  );
});

export default ProblemCard;
