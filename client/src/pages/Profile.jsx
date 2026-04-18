import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", bio: "" });

  useEffect(() => {
    api.get(`/users/${id}/profile`).then(({ data }) => {
      setData(data);
      setEditForm({ name: data.user.name, bio: data.user.bio || "" });
    }).finally(() => setLoading(false));
  }, [id]);

  const saveProfile = async () => {
    try {
      await api.put("/users/profile", editForm);
      setData((d) => ({ ...d, user: { ...d.user, ...editForm } }));
      setEditing(false);
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full spin" />
    </div>
  );
  if (!data) return <div className="text-center py-20 text-gray-400">User not found</div>;

  const { user: profile, problems, solutions } = data;
  const isOwnProfile = user?.id === id || user?._id === id;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="card p-6 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-light flex items-center justify-center text-brand-dark text-2xl font-bold shrink-0">
            {profile.name?.[0]}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="input text-lg font-semibold" />
                <textarea value={editForm.bio} onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))} className="input text-sm" placeholder="Tell us about yourself..." rows={2} />
                <div className="flex gap-2">
                  <button onClick={saveProfile} className="btn-primary text-sm">Save</button>
                  <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
                  <span className="tag bg-brand-light text-brand-dark text-xs">Level {profile.level}</span>
                  {isOwnProfile && (
                    <button onClick={() => setEditing(true)} className="btn-secondary text-xs py-1 ml-auto">Edit Profile</button>
                  )}
                </div>
                {profile.bio && <p className="text-sm text-gray-500 mt-1">{profile.bio}</p>}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span className="font-semibold text-amber-600">⬡ {profile.points?.toLocaleString()} pts</span>
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100">
          {[
            ["Problems Posted", profile.stats?.problemsPosted],
            ["Solutions Submitted", profile.stats?.solutionsSubmitted],
            ["Solutions Won", profile.stats?.solutionsWon],
            ["Votes Received", profile.stats?.totalVotesReceived],
          ].map(([label, val]) => (
            <div key={label} className="text-center">
              <div className="text-xl font-bold text-gray-900">{val || 0}</div>
              <div className="text-xs text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Badges */}
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Badges ({profile.badges?.length})</h3>
          <div className="space-y-2">
            {profile.badges?.length === 0 && <p className="text-sm text-gray-400">No badges yet.</p>}
            {profile.badges?.map((b, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-sm">{b.icon}</div>
                <div>
                  <p className="text-xs font-medium text-gray-900">{b.name}</p>
                  <p className="text-xs text-gray-400">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Problems */}
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Recent Problems</h3>
          {problems.length === 0 ? (
            <p className="text-sm text-gray-400">No problems posted.</p>
          ) : (
            <div className="space-y-2.5">
              {problems.map((p) => (
                <Link key={p._id} to={`/problems/${p._id}`} className="block hover:text-brand transition-colors">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <span>◎ {p.solutionCount}</span>
                    <span className={`tag text-xs ${p.status === "solved" ? "bg-brand-light text-brand-dark" : "bg-gray-100 text-gray-500"}`}>{p.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Solutions */}
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Recent Solutions</h3>
          {solutions.length === 0 ? (
            <p className="text-sm text-gray-400">No solutions submitted.</p>
          ) : (
            <div className="space-y-2.5">
              {solutions.map((s) => (
                <Link key={s._id} to={`/problems/${s.problem?._id}`} className="block hover:text-brand transition-colors">
                  <p className="text-xs text-gray-400">{s.problem?.title}</p>
                  <p className="text-sm text-gray-700 line-clamp-2 mt-0.5">{s.content}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <span>▲ {s.votes?.length}</span>
                    {s.isWinner && <span className="text-amber-500 font-medium">★ Winner</span>}
                    {s.aiEvaluation && <span className="text-brand">AI: {s.aiEvaluation.overallScore}/10</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
