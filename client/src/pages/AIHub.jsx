import { useState } from "react";
import api from "../api";
import { AIPanel, EvalScores, IdeaCard, ExpertCard } from "../components/AIPanel";

function AIToolCard({ icon, title, color, description, children }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${color}`}>
          {icon}
        </div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4 leading-relaxed">{description}</p>
      {children}
    </div>
  );
}

export default function AIHub() {
  const [analyzer, setAnalyzer] = useState({ input: "", loading: false, result: null, error: null });
  const [evaluator, setEvaluator] = useState({ problem: "", solution: "", loading: false, result: null, error: null });
  const [booster, setBooster] = useState({ idea: "", context: "", loading: false, result: null, error: null });
  const [matcher, setMatcher] = useState({ input: "", loading: false, result: null, error: null });

  const getApiError = (err, fallback) => {
    return err?.response?.data?.error || err?.response?.data?.message || err?.message || fallback;
  };

  const runAnalyzer = async () => {
    if (!analyzer.input.trim()) return;
    setAnalyzer((s) => ({ ...s, loading: true, result: null, error: null }));
    try {
      const { data } = await api.post("/ai/analyze-problem", {
        title: "",
        description: analyzer.input,
        expectedOutcome: "",
      });
      setAnalyzer((s) => ({ ...s, loading: false, result: data }));
    } catch (err) {
      setAnalyzer((s) => ({ ...s, loading: false, error: getApiError(err, "Problem analysis failed") }));
    }
  };

  const runEvaluator = async () => {
    if (!evaluator.solution.trim()) return;
    setEvaluator((s) => ({ ...s, loading: true, result: null, error: null }));
    try {
      const { data } = await api.post("/ai/evaluate-solution", {
        content: evaluator.solution,
        problemContext: evaluator.problem,
      });
      setEvaluator((s) => ({ ...s, loading: false, result: data }));
    } catch (err) {
      setEvaluator((s) => ({ ...s, loading: false, error: getApiError(err, "Solution evaluation failed") }));
    }
  };

  const runBooster = async () => {
    if (!booster.idea.trim()) return;
    setBooster((s) => ({ ...s, loading: true, result: null, error: null }));
    try {
      const { data } = await api.post("/ai/boost-idea", {
        idea: booster.idea,
        problemContext: booster.context,
      });
      setBooster((s) => ({ ...s, loading: false, result: data }));
    } catch (err) {
      setBooster((s) => ({ ...s, loading: false, error: getApiError(err, "Idea boosting failed") }));
    }
  };

  const runMatcher = async () => {
    if (!matcher.input.trim()) return;
    setMatcher((s) => ({ ...s, loading: true, result: null, error: null }));
    try {
      const { data } = await api.post("/ai/match-experts", { problemDescription: matcher.input });
      setMatcher((s) => ({ ...s, loading: false, result: data }));
    } catch (err) {
      setMatcher((s) => ({ ...s, loading: false, error: getApiError(err, "Expert matching failed") }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-accent-light text-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
        </div>
        <h1 className="text-2xl font-bold text-gray-900">AI Tools Hub</h1>
        <p className="text-gray-500 text-sm mt-1">Supercharge your problem-solving with these AI-powered tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Problem Analyzer */}
        <AIToolCard
          icon="✦" title="Problem Analyzer"
          color="bg-accent-light text-accent"
          description="Paste any problem statement to get an AI-powered analysis: clarity score, difficulty, suggested tags, key constraints, and improvement suggestions."
        >
          <textarea
            value={analyzer.input}
            onChange={(e) => setAnalyzer((s) => ({ ...s, input: e.target.value }))}
            className="input min-h-24 mb-3 text-sm"
            placeholder="Paste a problem statement here..."
          />
          <button onClick={runAnalyzer} disabled={analyzer.loading} className="btn-ai w-full justify-center py-2">
            {analyzer.loading ? <><span className="w-3.5 h-3.5 border-2 border-accent/30 border-t-accent rounded-full spin" />Analyzing...</> : "✦ Analyze Problem"}
          </button>

          {analyzer.error && (
            <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{analyzer.error}</p>
          )}

          {analyzer.result && (
            <div className="mt-4 space-y-3 fade-in">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Clarity Score</span>
                <span className={`text-xl font-bold ${analyzer.result.clarityScore >= 7 ? "text-brand" : "text-amber-500"}`}>
                  {analyzer.result.clarityScore}/10
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Difficulty</span>
                <span className={`font-semibold text-sm ${analyzer.result.difficulty === "Hard" ? "text-red-500" : analyzer.result.difficulty === "Medium" ? "text-amber-500" : "text-brand"}`}>
                  {analyzer.result.difficulty}
                </span>
              </div>
              {analyzer.result.suggestedTags?.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-2">Suggested Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analyzer.result.suggestedTags.map((t) => (
                      <span key={t} className="tag bg-brand-light text-brand-dark text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {analyzer.result.improvementSuggestions?.map((s, i) => (
                <div key={i} className="flex gap-2 text-sm text-gray-600 bg-accent-light rounded-lg p-3">
                  <span className="text-accent shrink-0">✦</span>{s}
                </div>
              ))}
            </div>
          )}
        </AIToolCard>

        {/* 2. Solution Evaluator */}
        <AIToolCard
          icon="★" title="Solution Evaluator"
          color="bg-brand-light text-brand-dark"
          description="Paste a solution and get detailed AI scores on feasibility, creativity, and effectiveness — plus strengths, improvements, and enhancement suggestions."
        >
          <input
            value={evaluator.problem}
            onChange={(e) => setEvaluator((s) => ({ ...s, problem: e.target.value }))}
            className="input mb-2 text-sm"
            placeholder="Problem context (optional)"
          />
          <textarea
            value={evaluator.solution}
            onChange={(e) => setEvaluator((s) => ({ ...s, solution: e.target.value }))}
            className="input min-h-24 mb-3 text-sm"
            placeholder="Paste your solution here..."
          />
          <button onClick={runEvaluator} disabled={evaluator.loading} className="btn-ai teal w-full justify-center py-2 bg-brand-light text-brand-dark border-brand/30 hover:bg-brand/20">
            {evaluator.loading ? <><span className="w-3.5 h-3.5 border-2 border-brand/30 border-t-brand rounded-full spin" />Evaluating...</> : "★ Evaluate Solution"}
          </button>

          {evaluator.error && (
            <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{evaluator.error}</p>
          )}

          {evaluator.result && (
            <div className="mt-4 fade-in">
              <EvalScores data={evaluator.result} />
            </div>
          )}
        </AIToolCard>

        {/* 3. Idea Booster */}
        <AIToolCard
          icon="◆" title="Idea Booster"
          color="bg-amber-50 text-amber-600"
          description="Enter a rough idea or concept and AI will expand it into a fully structured solution with implementation steps, timeline, resources needed, and expected impact."
        >
          <input
            value={booster.context}
            onChange={(e) => setBooster((s) => ({ ...s, context: e.target.value }))}
            className="input mb-2 text-sm"
            placeholder="Problem context (optional)"
          />
          <textarea
            value={booster.idea}
            onChange={(e) => setBooster((s) => ({ ...s, idea: e.target.value }))}
            className="input min-h-24 mb-3 text-sm"
            placeholder="Describe your rough idea..."
          />
          <button onClick={runBooster} disabled={booster.loading} className="btn-ai w-full justify-center py-2 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">
            {booster.loading ? <><span className="w-3.5 h-3.5 border-2 border-amber-200 border-t-amber-500 rounded-full spin" />Boosting...</> : "◆ Boost My Idea"}
          </button>

          {booster.error && (
            <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{booster.error}</p>
          )}

          {booster.result && (
            <div className="mt-4 space-y-3 fade-in">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-medium text-amber-700 mb-1">Refined Concept</p>
                <p className="text-sm font-semibold text-gray-900">{booster.result.refinedName}</p>
                <p className="text-sm text-gray-600 mt-1">{booster.result.coreMechanism}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 mb-2">Implementation Steps</p>
                {booster.result.implementationSteps?.map((s, i) => (
                  <div key={i} className="flex gap-2 text-sm text-gray-700 mb-1.5">
                    <span className="text-brand font-bold shrink-0">{i + 1}.</span>{s}
                  </div>
                ))}
              </div>
              {booster.result.expectedImpact && (
                <div className="bg-brand-light rounded-lg p-3">
                  <p className="text-xs font-medium text-brand-dark mb-1">Expected Impact</p>
                  <p className="text-sm text-brand-dark">{booster.result.expectedImpact}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs font-medium text-gray-500 mb-1">Timeline</p>
                  <p className="text-sm text-gray-700">{booster.result.timelineEstimate}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-xs font-medium text-gray-500 mb-1">Resources</p>
                  {booster.result.resourcesNeeded?.slice(0, 2).map((r, i) => (
                    <p key={i} className="text-xs text-gray-600">• {r}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </AIToolCard>

        {/* 4. Expert Matcher */}
        <AIToolCard
          icon="⬡" title="Expert Matcher"
          color="bg-blue-50 text-blue-700"
          description="Describe a problem and AI will identify the ideal expert profiles, skills, team composition, and key questions that experts should tackle first."
        >
          <textarea
            value={matcher.input}
            onChange={(e) => setMatcher((s) => ({ ...s, input: e.target.value }))}
            className="input min-h-24 mb-3 text-sm"
            placeholder="Describe the problem domain..."
          />
          <button onClick={runMatcher} disabled={matcher.loading} className="btn-ai w-full justify-center py-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
            {matcher.loading ? <><span className="w-3.5 h-3.5 border-2 border-blue-200 border-t-blue-500 rounded-full spin" />Matching...</> : "⬡ Match Experts"}
          </button>

          {matcher.error && (
            <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">{matcher.error}</p>
          )}

          {matcher.result && (
            <div className="mt-4 space-y-3 fade-in">
              <div className="grid grid-cols-2 gap-2">
                {matcher.result.experts?.map((e, i) => <ExpertCard key={i} expert={e} index={i} />)}
              </div>
              {matcher.result.keyQuestions?.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-700 mb-2">Key Questions to Answer First</p>
                  {matcher.result.keyQuestions.map((q, i) => (
                    <p key={i} className="text-xs text-blue-700 flex gap-1.5 mb-1"><span className="shrink-0">?</span>{q}</p>
                  ))}
                </div>
              )}
              {matcher.result.idealTeamSize && (
                <p className="text-xs text-gray-500 text-center">
                  Ideal team size: <span className="font-semibold text-gray-700">{matcher.result.idealTeamSize} people</span>
                </p>
              )}
            </div>
          )}
        </AIToolCard>
      </div>
    </div>
  );
}
