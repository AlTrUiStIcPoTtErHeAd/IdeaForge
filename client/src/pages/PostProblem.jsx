import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { AIPanel, AIOutput } from "../components/AIPanel";

const CATEGORIES = ["Tech", "Environment", "Health", "Education", "Social", "Business", "Other"];

export default function PostProblem() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", constraints: "",
    expectedOutcome: "", deadline: "", category: "Tech",
    tags: "", difficulty: "Medium",
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const analyzeWithAI = async () => {
    if (!form.description.trim()) { setError("Please fill in a description first."); return; }
    setAiLoading(true); setAnalysis(null);
    try {
      const { data } = await api.post("/ai/analyze-problem", {
        title: form.title,
        description: form.description,
        expectedOutcome: form.expectedOutcome,
        constraints: form.constraints,
      });
      setAnalysis(data);
      // Auto-fill tags if empty
      if (!form.tags && data.suggestedTags?.length) {
        set("tags", data.suggestedTags.join(", "));
      }
      if (data.difficulty) set("difficulty", data.difficulty);
    } catch (e) {
      setError("AI analysis failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      const { data } = await api.post("/problems", payload);
      navigate(`/problems/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post problem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Post a Problem</h1>
        <p className="text-gray-500 text-sm mt-1">Share a challenge for the community to solve</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Problem Details</h2>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Title *</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)}
                className="input" placeholder="Clear and specific title" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Category *</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="input">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Description *</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                className="input min-h-32" placeholder="Describe the problem in detail — context, background, why it matters..." required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Constraints</label>
              <textarea value={form.constraints} onChange={(e) => set("constraints", e.target.value)}
                className="input min-h-20" placeholder="Budget limits, technical restrictions, must-haves..." />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Expected Outcome *</label>
              <input value={form.expectedOutcome} onChange={(e) => set("expectedOutcome", e.target.value)}
                className="input" placeholder="What does a successful solution look like?" required />
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Additional Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Difficulty</label>
                <select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)} className="input">
                  <option>Easy</option><option>Medium</option><option>Hard</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Deadline</label>
                <input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className="input" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Tags (comma separated)</label>
              <input value={form.tags} onChange={(e) => set("tags", e.target.value)}
                className="input" placeholder="AI, sustainability, mobile..." />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button" onClick={analyzeWithAI} disabled={aiLoading}
              className="btn-ai flex-1 justify-center py-2.5 text-sm"
            >
              {aiLoading ? (
                <><span className="w-3.5 h-3.5 border-2 border-accent/30 border-t-accent rounded-full spin" /> Analyzing...</>
              ) : "✦ Analyze with AI"}
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 text-sm">
              {loading ? "Posting..." : "Post Problem"}
            </button>
          </div>
        </form>

        {/* AI Panel */}
        <div className="lg:col-span-2">
          <div className="sticky top-20">
            <AIPanel title="AI Problem Analyzer">
              {aiLoading && (
                <div className="flex items-center gap-2 text-sm text-accent/70 italic py-2">
                  <div className="w-3.5 h-3.5 border-2 border-accent/30 border-t-accent rounded-full spin" />
                  Analyzing your problem statement...
                </div>
              )}
              {!analysis && !aiLoading && (
                <p className="text-xs text-accent/60 leading-relaxed">
                  Fill in the problem details and click "Analyze with AI" to get instant feedback on clarity, difficulty, suggested tags, key constraints, and improvement tips.
                </p>
              )}
              {analysis && (
                <div className="space-y-3 fade-in">
                  {/* Clarity score */}
                  <div className="bg-white border border-purple-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">Clarity Score</span>
                      <span className={`text-lg font-bold ${analysis.clarityScore >= 7 ? "text-brand" : analysis.clarityScore >= 5 ? "text-amber-500" : "text-red-400"}`}>
                        {analysis.clarityScore}/10
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2 mb-1.5">
                      <div className="h-2 rounded-full bg-brand" style={{ width: `${analysis.clarityScore * 10}%` }} />
                    </div>
                    <p className="text-xs text-gray-500">{analysis.clarityReason}</p>
                  </div>
                  {/* Difficulty */}
                  <div className="bg-white border border-purple-100 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600 mb-1">Difficulty: <span className={`font-bold ${analysis.difficulty === "Hard" ? "text-red-500" : analysis.difficulty === "Medium" ? "text-amber-500" : "text-brand"}`}>{analysis.difficulty}</span></p>
                    <p className="text-xs text-gray-500">{analysis.difficultyReason}</p>
                  </div>
                  {/* Suggested tags */}
                  {analysis.suggestedTags?.length > 0 && (
                    <div className="bg-white border border-purple-100 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-600 mb-2">Suggested Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.suggestedTags.map((t) => (
                          <span key={t} className="tag bg-brand-light text-brand-dark text-xs">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Key constraints */}
                  {analysis.keyConstraints?.length > 0 && (
                    <div className="bg-white border border-purple-100 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-600 mb-2">Key Constraints Identified</p>
                      {analysis.keyConstraints.map((c, i) => (
                        <p key={i} className="text-xs text-gray-600 flex gap-1.5 mb-1"><span className="text-amber-500 shrink-0">⚠</span>{c}</p>
                      ))}
                    </div>
                  )}
                  {/* Improvements */}
                  {analysis.improvementSuggestions?.length > 0 && (
                    <div className="bg-white border border-purple-100 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-600 mb-2">Suggestions to Improve</p>
                      {analysis.improvementSuggestions.map((s, i) => (
                        <p key={i} className="text-xs text-gray-600 flex gap-1.5 mb-1"><span className="text-accent shrink-0">✦</span>{s}</p>
                      ))}
                    </div>
                  )}
                  {/* Promising direction */}
                  {analysis.promisingDirection && (
                    <div className="bg-brand-light border border-brand/20 rounded-lg p-3">
                      <p className="text-xs font-medium text-brand-dark mb-1">Most Promising Solution Direction</p>
                      <p className="text-xs text-brand-dark">{analysis.promisingDirection}</p>
                    </div>
                  )}
                </div>
              )}
            </AIPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
