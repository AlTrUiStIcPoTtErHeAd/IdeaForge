import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

function StatCard({ label, value, color = "text-gray-900" }) {
  return (
    <div className="card p-4 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}

const BADGE_ICONS = { "★": "bg-amber-50 text-amber-600", "◆": "bg-accent-light text-accent", "◎": "bg-brand-light text-brand-dark", "⬡": "bg-blue-50 text-blue-600", "▲": "bg-pink-50 text-pink-600", "Welcome": "bg-gray-100 text-gray-500" };

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [data, setData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    Promise.all([
      api.get("/users/me/dashboard"),
      api.get("/users/leaderboard"),
    ]).then(([d, l]) => {
      setData(d.data);
      setLeaderboard(l.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full spin" />
    </div>
  );

  const { myProblems, mySolutions, myRank, totalUsers, xpProgress, xpNeeded } = data;
  const xpPct = Math.round((xpProgress / xpNeeded) * 100);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center text-brand-dark text-xl font-bold">
          {user?.name?.[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="tag bg-brand-light text-brand-dark text-xs">Level {user?.level}</span>
            <span className="text-xs text-gray-400">Rank #{myRank} of {totalUsers}</span>
            <span className="text-xs text-amber-600 font-medium">⬡ {user?.points?.toLocaleString()} pts</span>
          </div>
        </div>
        <div className="ml-auto">
          <Link to="/post" className="btn-primary">+ Post Problem</Link>
        </div>
      </div>

      {/* XP Progress */}
      <div className="card p-4 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Level {user?.level} Progress</span>
          <span className="text-gray-400">{xpProgress} / {xpNeeded} XP</span>
        </div>
        <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
          <div className="h-3 rounded-full bg-brand transition-all" style={{ width: `${xpPct}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{xpNeeded - xpProgress} XP to Level {(user?.level || 0) + 1}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Problems Posted" value={user?.stats?.problemsPosted || 0} />
        <StatCard label="Solutions Submitted" value={user?.stats?.solutionsSubmitted || 0} />
        <StatCard label="Solutions Won" value={user?.stats?.solutionsWon || 0} color="text-brand" />
        <StatCard label="Votes Received" value={user?.stats?.totalVotesReceived || 0} color="text-amber-500" />
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-5">
        {["overview", "my problems", "my solutions", "leaderboard"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Badges */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Badges ({user?.badges?.length || 0})</h3>
            {user?.badges?.length === 0 ? (
              <p className="text-sm text-gray-400">No badges yet. Start posting and solving!</p>
            ) : (
              <div className="space-y-2">
                {user?.badges?.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base ${BADGE_ICONS[b.icon] || "bg-gray-100 text-gray-500"}`}>
                      {b.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{b.name}</p>
                      <p className="text-xs text-gray-400">{b.description}</p>
                    </div>
                    <span className="ml-auto text-xs text-gray-300">{new Date(b.earnedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {[...myProblems.slice(0, 2), ...mySolutions.slice(0, 2)]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 6)
                .map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${item.expectedOutcome ? "bg-brand-light text-brand-dark" : "bg-blue-50 text-blue-600"}`}>
                      {item.expectedOutcome ? "P" : "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 truncate">{item.title || item.problem?.title || "Solution"}</p>
                      <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              {myProblems.length === 0 && mySolutions.length === 0 && (
                <p className="text-sm text-gray-400">No activity yet.</p>
              )}
            </div>
          </div>

          {/* Point breakdown */}
          <div className="card p-4 md:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-3">How to earn more points</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { action: "Post a problem", pts: "+50 pts", icon: "◈" },
                { action: "Submit a solution", pts: "+100 pts", icon: "◎" },
                { action: "Get your solution upvoted", pts: "+10 pts", icon: "▲" },
                { action: "Win a challenge", pts: "+500 pts", icon: "★" },
              ].map((e) => (
                <div key={e.action} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xl mb-1 text-brand">{e.icon}</div>
                  <p className="text-xs text-gray-600 mb-1">{e.action}</p>
                  <p className="text-sm font-bold text-amber-600">{e.pts}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* My Problems */}
      {tab === "my problems" && (
        <div>
          {myProblems.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">◈</p>
              <p className="font-medium">No problems posted yet</p>
              <Link to="/post" className="btn-primary mt-3 inline-block">Post your first problem</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myProblems.map((p) => (
                <Link key={p._id} to={`/problems/${p._id}`}>
                  <div className="card p-4 hover:border-brand/30 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">{p.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>◎ {p.solutionCount} solutions</span>
                          <span>▲ {p.votes?.length || 0} votes</span>
                          <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className={`tag text-xs shrink-0 ${p.status === "open" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Solutions */}
      {tab === "my solutions" && (
        <div>
          {mySolutions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">◎</p>
              <p className="font-medium">No solutions submitted yet</p>
              <Link to="/" className="btn-primary mt-3 inline-block">Find problems to solve</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {mySolutions.map((s) => (
                <Link key={s._id} to={`/problems/${s.problem?._id}`}>
                  <div className={`card p-4 hover:border-brand/30 transition-colors cursor-pointer ${s.isWinner ? "border-brand bg-brand-light/20" : ""}`}>
                    <div className="flex items-start gap-3">
                      {s.isWinner && <span className="text-amber-500 text-lg shrink-0">★</span>}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 mb-1">For: {s.problem?.title}</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{s.content}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                          <span>▲ {s.votes?.length || 0} votes</span>
                          {s.aiEvaluation && <span className="text-brand font-medium">AI: {s.aiEvaluation.overallScore}/10</span>}
                          <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leaderboard */}
      {tab === "leaderboard" && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Top Contributors</h3>
          <div className="space-y-3">
            {leaderboard.map((u, i) => (
              <Link key={u._id} to={`/profile/${u._id}`}>
                <div className={`flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors ${u._id === user?.id ? "bg-brand-light/30" : ""}`}>
                  <span className={`text-sm font-bold w-6 text-center ${i === 0 ? "text-amber-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-gray-300"}`}>
                    {i + 1}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center text-brand-dark font-semibold">
                    {u.name?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{u.name} {u._id === user?.id && <span className="text-xs text-brand">(you)</span>}</p>
                    <p className="text-xs text-gray-400">Level {u.level} · {u.stats?.solutionsSubmitted} solutions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-600">⬡ {u.points?.toLocaleString()}</p>
                    <p className="text-xs text-gray-300">{u.badges?.length} badges</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
