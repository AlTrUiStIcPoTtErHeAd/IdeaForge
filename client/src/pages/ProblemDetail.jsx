import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import SolutionCard from "../components/SolutionCard";
import { AIPanel, IdeaCard } from "../components/AIPanel";

const CAT_COLORS = {
  Tech: "bg-blue-50 text-blue-700", Environment: "bg-emerald-50 text-emerald-700",
  Health: "bg-teal-50 text-teal-700", Education: "bg-purple-50 text-purple-700",
  Social: "bg-pink-50 text-pink-700", Business: "bg-amber-50 text-amber-700",
};

export default function ProblemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solutionText, setSolutionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ranking, setRanking] = useState(false);
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [gettingFeedback, setGettingFeedback] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState("solutions");
  const [notification, setNotification] = useState("");
  const [editingStatus, setEditingStatus] = useState(false);

  useEffect(() => {
    fetchAll();
    const socket = io();
    socket.emit("join-problem", id);
    socket.on("new-solution", (sol) => {
      setSolutions((s) => [sol, ...s]);
      showNotif("New solution submitted!");
    });
    socket.on("winner-selected", () => fetchAll());
    return () => socket.disconnect();
  }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        api.get(`/problems/${id}`),
        api.get(`/solutions/problem/${id}`),
      ]);
      setProblem(pRes.data);
      setSolutions(sRes.data);
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const showNotif = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleVoteProblem = async () => {
    if (!user) return navigate("/login");
    try {
      const { data } = await api.post(`/problems/${id}/vote`);
      setProblem((p) => ({ ...p, votes: data.voted ? [...(p.votes || []), user.id] : (p.votes || []).filter((v) => v !== user.id) }));
    } catch (e) { console.error(e); }
  };

  const handleVoteSolution = async (solId) => {
    if (!user) return navigate("/login");
    try {
      await api.post(`/solutions/${solId}/vote`);
      const { data } = await api.get(`/solutions/problem/${id}`);
      setSolutions(data);
    } catch (e) { console.error(e); }
  };

  const handleMarkWinner = async (solId) => {
    try {
      await api.post(`/solutions/${solId}/mark-winner`);
      fetchAll();
      showNotif("Winner marked! Problem solved!");
    } catch (e) { console.error(e); }
  };

  const submitSolution = async () => {
    if (!user) return navigate("/login");
    if (!solutionText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post("/solutions", { problemId: id, content: solutionText });
      setSolutions((s) => [data, ...s]);
      setSolutionText("");
      setFeedback(null);
      showNotif("Solution submitted! +100 pts");
    } catch (err) {
      alert(err.response?.data?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const rankSolutions = async () => {
    setRanking(true);
    try {
      await api.post("/ai/rank-solutions", { problemId: id });
      const { data } = await api.get(`/solutions/problem/${id}`);
      setSolutions(data);
      showNotif("AI ranking complete!");
    } catch (e) { console.error(e); }
    finally { setRanking(false); }
  };

  const generateIdeas = async () => {
    setGeneratingIdeas(true); setIdeas([]);
    try {
      const { data } = await api.post("/ai/generate-ideas", { problemId: id });
      setIdeas(data.ideas || []);
      setActiveTab("ideas");
    } catch (e) { console.error(e); }
    finally { setGeneratingIdeas(false); }
  };

  const getAIFeedback = async () => {
    if (!solutionText.trim()) { alert("Write your solution first."); return; }
    setGettingFeedback(true); setFeedback(null);
    try {
      const { data } = await api.post("/ai/evaluate-solution", {
        content: solutionText,
        problemContext: problem?.description,
      });
      setFeedback(data);
    } catch (e) { console.error(e); }
    finally { setGettingFeedback(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full spin" />
    </div>
  );

  if (!problem) return null;

  const isOwner = user && (user.id === problem.postedBy?._id || user._id === problem.postedBy?._id);
  const hasVoted = problem.votes?.includes(user?.id || user?._id);
  const daysLeft = problem.deadline ? Math.max(0, Math.ceil((new Date(problem.deadline) - new Date()) / 86400000)) : null;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Notification toast */}
      {notification && (
        <div className="fixed top-16 right-4 bg-brand text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg fade-in z-50">
          {notification}
        </div>
      )}

      {/* Back */}
      <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-4 transition-colors">
        ← All Problems
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Problem card */}
          <div className="card p-5">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`tag ${CAT_COLORS[problem.category] || "bg-gray-100 text-gray-600"}`}>
                {problem.category}
              </span>
              {problem.tags?.map((t) => (
                <span key={t} className="tag bg-gray-100 text-gray-500 text-xs">{t}</span>
              ))}
              <span className={`tag ml-auto ${problem.status === "open" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                {problem.status}
              </span>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-3">{problem.title}</h1>
            <p className="text-gray-600 leading-relaxed mb-4">{problem.description}</p>

            {problem.constraints && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-xs font-semibold text-amber-700 mb-1">⚠ Constraints</p>
                <p className="text-sm text-amber-700">{problem.constraints}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Expected Outcome</p>
                <p className="text-sm text-gray-700">{problem.expectedOutcome}</p>
              </div>
              {daysLeft !== null && (
                <div className={`rounded-lg p-3 ${daysLeft < 3 ? "bg-red-50" : "bg-gray-50"}`}>
                  <p className="text-xs text-gray-400 mb-1">Deadline</p>
                  <p className={`text-sm font-medium ${daysLeft < 3 ? "text-red-600" : "text-gray-700"}`}>
                    {daysLeft === 0 ? "Due today!" : `${daysLeft} days left`}
                  </p>
                </div>
              )}
            </div>

            {/* Author + actions */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
              {problem.postedBy && (
                <Link to={`/profile/${problem.postedBy._id}`} className="flex items-center gap-2 hover:opacity-80">
                  <div className="w-7 h-7 rounded-full bg-brand-light flex items-center justify-center text-brand-dark text-xs font-semibold">
                    {problem.postedBy.name?.[0]}
                  </div>
                  <span className="text-sm text-gray-600">{problem.postedBy.name}</span>
                </Link>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={handleVoteProblem}
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${hasVoted ? "bg-brand-light text-brand" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  ▲ {problem.votes?.length || 0} {hasVoted ? "Voted" : "Vote"}
                </button>
                <span className="text-sm text-gray-400">◉ {problem.views} views</span>
              </div>
            </div>

            {/* Owner controls */}
            {isOwner && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                <select
                  value={problem.status}
                  onChange={async (e) => {
                    await api.put(`/problems/${id}`, { status: e.target.value });
                    setProblem((p) => ({ ...p, status: e.target.value }));
                  }}
                  className="input text-xs py-1.5 w-auto"
                >
                  <option value="open">Open</option>
                  <option value="in-review">In Review</option>
                  <option value="solved">Solved</option>
                  <option value="closed">Closed</option>
                </select>
                <Link to={`/post?edit=${id}`} className="btn-secondary text-xs py-1.5">Edit</Link>
              </div>
            )}
          </div>

          {/* AI Toolbar */}
          <div className="flex flex-wrap gap-2 p-3 bg-accent-light border border-purple-200 rounded-xl">
            <span className="text-xs font-semibold text-accent self-center mr-1">✦ AI Tools</span>
            <button onClick={generateIdeas} disabled={generatingIdeas} className="btn-ai">
              {generatingIdeas ? <><span className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full spin" />Generating...</> : "✦ Generate Ideas"}
            </button>
            <button onClick={rankSolutions} disabled={ranking || solutions.length === 0} className="btn-ai">
              {ranking ? <><span className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full spin" />Ranking...</> : "★ Rank Solutions"}
            </button>
            <button onClick={() => api.post("/ai/match-experts", { problemDescription: problem.description }).then(({ data }) => setIdeas(data.experts?.map(e => ({ name: e.role, tagline: e.whyNeeded, approach: e.skills?.join(", "), steps: [] })) || [])) && setActiveTab("ideas")} className="btn-ai">
              ⬡ Match Experts
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-gray-200 mb-0">
            {[
              { key: "solutions", label: `Solutions (${solutions.length})` },
              { key: "ideas", label: ideas.length ? `AI Ideas (${ideas.length})` : "AI Ideas" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === t.key ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Solutions list */}
          {activeTab === "solutions" && (
            <div className="space-y-3">
              {solutions.length === 0 ? (
                <div className="card p-8 text-center text-gray-400">
                  <p className="text-3xl mb-2">◎</p>
                  <p className="font-medium text-gray-500">No solutions yet</p>
                  <p className="text-sm">Be the first to submit a solution below</p>
                </div>
              ) : (
                solutions.map((s, i) => (
                  <SolutionCard
                    key={s._id}
                    solution={s}
                    rank={s.aiEvaluation ? i + 1 : undefined}
                    isWinner={s.isWinner}
                    onVote={handleVoteSolution}
                    canPickWinner={isOwner && problem.status !== "solved"}
                    onMarkWinner={handleMarkWinner}
                  />
                ))
              )}
            </div>
          )}

          {/* AI Ideas */}
          {activeTab === "ideas" && (
            <div className="space-y-3">
              {generatingIdeas && (
                <div className="flex items-center gap-2 text-sm text-accent italic py-4">
                  <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full spin" />
                  Generating creative ideas...
                </div>
              )}
              {ideas.length === 0 && !generatingIdeas && (
                <div className="card p-8 text-center text-gray-400">
                  <p className="text-3xl mb-2">✦</p>
                  <p className="font-medium text-gray-500">Click "Generate Ideas" to get AI-powered solution concepts</p>
                </div>
              )}
              {ideas.map((idea, i) => <IdeaCard key={i} idea={idea} index={i} />)}
            </div>
          )}

          {/* Submit solution */}
          {problem.status === "open" && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Submit Your Solution</h3>
              <textarea
                value={solutionText}
                onChange={(e) => setSolutionText(e.target.value)}
                className="input min-h-28 mb-3"
                placeholder="Describe your solution in detail — approach, implementation steps, expected outcomes..."
              />

              {/* AI Feedback on draft */}
              {feedback && (
                <div className="bg-accent-light border border-purple-200 rounded-lg p-3 mb-3 fade-in">
                  <p className="text-xs font-semibold text-accent mb-2">✦ AI Feedback on your draft</p>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {[["Feasibility", feedback.feasibility], ["Creativity", feedback.creativity], ["Effectiveness", feedback.effectiveness]].map(([l, v]) => (
                      <div key={l} className="bg-white rounded p-2 text-center">
                        <p className="text-xs text-gray-400">{l}</p>
                        <p className={`font-bold ${v >= 7 ? "text-brand" : v >= 5 ? "text-amber-500" : "text-red-400"}`}>{v}/10</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {feedback.strengths?.map((s, i) => <p key={i} className="text-xs text-emerald-700 flex gap-1"><span>✓</span>{s}</p>)}
                    {feedback.improvements?.map((s, i) => <p key={i} className="text-xs text-amber-600 flex gap-1"><span>△</span>{s}</p>)}
                    {feedback.enhancement && <p className="text-xs text-accent italic mt-1">✦ {feedback.enhancement}</p>}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={getAIFeedback} disabled={gettingFeedback || !solutionText.trim()} className="btn-ai flex-1 justify-center">
                  {gettingFeedback ? <><span className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full spin" />Reviewing...</> : "✦ AI Feedback"}
                </button>
                <button onClick={submitSolution} disabled={submitting || !solutionText.trim()} className="btn-primary flex-1">
                  {submitting ? "Submitting..." : "Submit Solution"}
                </button>
              </div>
              {!user && (
                <p className="text-xs text-center text-gray-400 mt-2">
                  <Link to="/login" className="text-brand hover:underline">Log in</Link> to submit a solution
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Problem Stats</h3>
            <div className="space-y-2">
              {[
                ["▲ Votes", problem.votes?.length || 0],
                ["◎ Solutions", solutions.length],
                ["⊕ Contributors", problem.contributorCount || 0],
                ["◉ Views", problem.views || 0],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis saved */}
          {problem.aiAnalysis && (
            <AIPanel title="AI Analysis" icon="✦">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-accent/70">Clarity</span>
                  <span className="text-sm font-bold text-accent">{problem.aiAnalysis.clarityScore}/10</span>
                </div>
                {problem.aiAnalysis.suggestedTags?.length > 0 && (
                  <div>
                    <p className="text-xs text-accent/70 mb-1">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {problem.aiAnalysis.suggestedTags.map((t) => (
                        <span key={t} className="tag bg-white text-accent text-xs">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AIPanel>
          )}

          {/* Top voter */}
          {solutions.filter((s) => s.aiEvaluation).length > 0 && (
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3">AI Top Pick</h3>
              {solutions.filter((s) => s.aiEvaluation).sort((a, b) => b.aiEvaluation.overallScore - a.aiEvaluation.overallScore).slice(0, 1).map((s) => (
                <div key={s._id} className="text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-brand-light flex items-center justify-center text-brand-dark text-xs font-bold">{s.submittedBy?.name?.[0]}</div>
                    <span className="font-medium text-gray-800">{s.submittedBy?.name}</span>
                    <span className="ml-auto text-brand font-bold">{s.aiEvaluation.overallScore}/10</span>
                  </div>
                  <p className="text-gray-500 text-xs line-clamp-3">{s.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
