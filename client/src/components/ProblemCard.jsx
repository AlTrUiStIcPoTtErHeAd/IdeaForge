import { Link } from "react-router-dom";

const CAT_COLORS = {
  Tech: "bg-blue-50 text-blue-700",
  Environment: "bg-emerald-50 text-emerald-700",
  Health: "bg-teal-50 text-teal-700",
  Education: "bg-purple-50 text-purple-700",
  Social: "bg-pink-50 text-pink-700",
  Business: "bg-amber-50 text-amber-700",
  Other: "bg-gray-100 text-gray-600",
};

const DIFF_COLORS = {
  Easy: "text-emerald-600",
  Medium: "text-amber-600",
  Hard: "text-red-500",
};

const STATUS_COLORS = {
  open: "bg-emerald-50 text-emerald-700",
  "in-review": "bg-blue-50 text-blue-700",
  solved: "bg-gray-100 text-gray-500",
  closed: "bg-red-50 text-red-500",
};

export default function ProblemCard({ problem }) {
  const daysLeft = problem.deadline
    ? Math.max(0, Math.ceil((new Date(problem.deadline) - new Date()) / 86400000))
    : null;

  return (
    <Link to={`/problems/${problem._id}`} className="block">
      <div className="card p-4 hover:border-brand/40 hover:shadow-md transition-all cursor-pointer group fade-in">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2.5">
          <span className={`tag ${CAT_COLORS[problem.category] || CAT_COLORS.Other}`}>
            {problem.category}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${DIFF_COLORS[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
            <span className={`tag ${STATUS_COLORS[problem.status]}`}>
              {problem.status}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-1.5 group-hover:text-brand transition-colors leading-snug line-clamp-2">
          {problem.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {problem.description}
        </p>

        {/* Tags */}
        {problem.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {problem.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="tag bg-gray-100 text-gray-500 text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-50">
          <span className="flex items-center gap-1">
            <span>▲</span> {problem.votes?.length || 0}
          </span>
          <span className="flex items-center gap-1">
            <span>◎</span> {problem.solutionCount || 0} solutions
          </span>
          <span className="flex items-center gap-1">
            <span>⊕</span> {problem.contributorCount || 0}
          </span>
          {daysLeft !== null && (
            <span className={`ml-auto font-medium ${daysLeft < 3 ? "text-red-400" : "text-gray-400"}`}>
              {daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
            </span>
          )}
        </div>

        {/* Posted by */}
        {problem.postedBy && (
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-50">
            <div className="w-4 h-4 rounded-full bg-brand-light flex items-center justify-center text-brand-dark text-xs font-semibold">
              {problem.postedBy.name?.[0]}
            </div>
            <span className="text-xs text-gray-400">{problem.postedBy.name}</span>
            {problem.postedBy.level && (
              <span className="text-xs text-gray-300">· Lv {problem.postedBy.level}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
