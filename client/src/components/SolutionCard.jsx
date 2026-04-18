import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

function ScoreBar({ label, value }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-400 w-24 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full bg-brand transition-all"
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
      <span className="font-mono text-gray-600 w-6 text-right">{value}</span>
    </div>
  );
}

export default function SolutionCard({ solution, rank, isWinner, onVote, canPickWinner, onMarkWinner }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(solution.comments || []);
  const [showVersions, setShowVersions] = useState(false);

  const hasVoted = solution.votes?.includes(user?._id || user?.id);

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      const { data } = await api.post(`/solutions/${solution._id}/comment`, { text: comment });
      setComments((c) => [...c, data]);
      setComment("");
    } catch (e) {
      console.error(e);
    }
  };

  const eval_ = solution.aiEvaluation;

  return (
    <div className={`card p-4 fade-in ${isWinner ? "border-brand ring-1 ring-brand/20" : ""}`}>
      {/* Winner banner */}
      {isWinner && (
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-brand">
          <span className="text-lg">★</span> Winner Solution
        </div>
      )}

      {/* Rank + Author */}
      <div className="flex items-start gap-3 mb-3">
        {rank && (
          <div className={`text-xl font-bold shrink-0 ${rank === 1 ? "text-brand" : rank === 2 ? "text-gray-400" : "text-gray-300"}`}>
            {rank === 1 ? "①" : rank === 2 ? "②" : "③"}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/profile/${solution.submittedBy?._id}`}>
              <div className="w-6 h-6 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-semibold">
                {solution.submittedBy?.name?.[0]}
              </div>
            </Link>
            <Link to={`/profile/${solution.submittedBy?._id}`} className="text-sm font-medium hover:text-brand transition-colors">
              {solution.submittedBy?.name}
            </Link>
            {solution.submittedBy?.level && (
              <span className="text-xs text-gray-300">Lv {solution.submittedBy.level}</span>
            )}
            {eval_?.overallScore && (
              <span className={`tag ml-auto ${eval_.overallScore >= 7 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                AI: {eval_.overallScore}/10
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{solution.content}</p>
        </div>
      </div>

      {/* AI Evaluation */}
      {eval_ && (
        <div className="bg-accent-light rounded-lg p-3 mb-3 space-y-1.5">
          <p className="text-xs font-semibold text-accent mb-2">✦ AI Evaluation</p>
          <ScoreBar label="Feasibility" value={eval_.feasibilityScore} />
          <ScoreBar label="Creativity" value={eval_.creativityScore} />
          <ScoreBar label="Effectiveness" value={eval_.effectivenessScore} />
          {eval_.feedback && (
            <p className="text-xs text-accent/80 italic mt-2 pt-1.5 border-t border-purple-200">
              "{eval_.feedback}"
            </p>
          )}
        </div>
      )}

      {/* Version history */}
      {solution.versions?.length > 1 && (
        <button
          onClick={() => setShowVersions(!showVersions)}
          className="text-xs text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1"
        >
          ◷ {solution.versions.length} versions {showVersions ? "▲" : "▼"}
        </button>
      )}
      {showVersions && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
          {solution.versions?.map((v, i) => (
            <div key={i} className="text-xs">
              <span className="text-gray-400">{new Date(v.editedAt).toLocaleDateString()} — </span>
              <span className="text-gray-500 italic">{v.editNote}</span>
              <p className="text-gray-600 mt-0.5 line-clamp-2">{v.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-50 text-xs flex-wrap">
        <button
          onClick={() => onVote?.(solution._id)}
          className={`flex items-center gap-1.5 font-medium transition-colors ${
            hasVoted ? "text-brand" : "text-gray-400 hover:text-brand"
          }`}
        >
          ▲ {solution.votes?.length || 0} {hasVoted ? "Voted" : "Vote"}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ◉ {comments.length} comments
        </button>
        <span className="text-gray-200">·</span>
        <span className="text-gray-300">{new Date(solution.createdAt).toLocaleDateString()}</span>
        {canPickWinner && !isWinner && (
          <button
            onClick={() => onMarkWinner?.(solution._id)}
            className="ml-auto btn-ai"
          >
            ★ Mark as Winner
          </button>
        )}
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <div className="space-y-2 mb-3">
            {comments.map((c, i) => (
              <div key={i} className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs shrink-0">
                  {c.user?.name?.[0] || "?"}
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-700">{c.user?.name || "User"}</span>
                  <span className="text-xs text-gray-500 ml-1.5">{c.text}</span>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-xs text-gray-400">No comments yet. Be first!</p>
            )}
          </div>
          {user && (
            <div className="flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                placeholder="Add a comment..."
                className="input text-xs py-1.5 flex-1"
              />
              <button onClick={handleComment} className="btn-primary text-xs py-1.5 px-3">
                Send
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
