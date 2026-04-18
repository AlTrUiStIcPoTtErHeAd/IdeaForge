export function AIPanel({ title, icon = "✦", children, className = "" }) {
  return (
    <div className={`bg-accent-light border border-purple-200 rounded-xl p-4 ${className}`}>
      <p className="text-xs font-semibold text-accent mb-3 flex items-center gap-1.5">
        <span>{icon}</span> {title}
      </p>
      {children}
    </div>
  );
}

export function AIOutput({ text, loading, className = "" }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-accent/70 italic py-2">
        <div className="w-3.5 h-3.5 border-2 border-accent/30 border-t-accent rounded-full spin" />
        Thinking...
      </div>
    );
  }
  if (!text) return null;
  return (
    <div className={`bg-white border border-purple-100 rounded-lg p-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap fade-in ${className}`}>
      {text}
    </div>
  );
}

export function IdeaCard({ idea, index }) {
  const colors = ["bg-brand-light text-brand-dark", "bg-blue-50 text-blue-700", "bg-amber-50 text-amber-700"];
  return (
    <div className="bg-white border border-purple-100 rounded-lg p-3.5 fade-in">
      <div className="flex items-center gap-2 mb-2">
        <span className={`tag text-xs font-bold ${colors[index % 3]}`}>
          Idea {index + 1}
        </span>
        <span className="font-semibold text-gray-900 text-sm">{idea.name}</span>
      </div>
      <p className="text-xs text-gray-500 italic mb-2">{idea.tagline}</p>
      <p className="text-sm text-gray-700 mb-2 leading-relaxed">{idea.approach}</p>
      <div className="space-y-1">
        {idea.steps?.map((s, i) => (
          <div key={i} className="flex gap-2 text-xs text-gray-600">
            <span className="text-brand font-bold shrink-0">{i + 1}.</span>
            <span>{s}</span>
          </div>
        ))}
      </div>
      {idea.challenge && (
        <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
          ⚠ {idea.challenge}
        </div>
      )}
    </div>
  );
}

export function EvalScores({ data }) {
  const bars = [
    { label: "Feasibility", value: data.feasibility },
    { label: "Creativity", value: data.creativity },
    { label: "Effectiveness", value: data.effectiveness },
  ];
  return (
    <div className="bg-white border border-purple-100 rounded-lg p-3.5 fade-in space-y-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Overall Score</span>
        <span className={`text-2xl font-bold ${data.overall >= 7 ? "text-brand" : data.overall >= 5 ? "text-amber-500" : "text-red-400"}`}>
          {data.overall}<span className="text-base text-gray-300">/10</span>
        </span>
      </div>
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-3 text-xs">
          <span className="text-gray-400 w-24 shrink-0">{b.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div className="h-2 rounded-full bg-brand transition-all" style={{ width: `${b.value * 10}%` }} />
          </div>
          <span className="font-mono text-gray-600 w-5 text-right">{b.value}</span>
        </div>
      ))}
      {data.strengths && (
        <div className="pt-2 border-t border-purple-100 space-y-1">
          {data.strengths.map((s, i) => (
            <p key={i} className="text-xs text-emerald-700 flex gap-1.5"><span>✓</span>{s}</p>
          ))}
          {data.improvements.map((s, i) => (
            <p key={i} className="text-xs text-amber-600 flex gap-1.5"><span>△</span>{s}</p>
          ))}
          {data.enhancement && (
            <p className="text-xs text-accent italic mt-1">"✦ {data.enhancement}"</p>
          )}
        </div>
      )}
    </div>
  );
}

export function ExpertCard({ expert, index }) {
  const colors = [
    { bg: "bg-accent-light", text: "text-accent" },
    { bg: "bg-brand-light", text: "text-brand-dark" },
    { bg: "bg-blue-50", text: "text-blue-700" },
    { bg: "bg-amber-50", text: "text-amber-700" },
  ];
  const c = colors[index % 4];
  return (
    <div className="bg-white border border-purple-100 rounded-lg p-3 fade-in">
      <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center ${c.text} text-sm font-bold mb-2`}>
        {index + 1}
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">{expert.role}</p>
      <p className="text-xs text-gray-500 mb-2">{expert.whyNeeded}</p>
      <div className="flex flex-wrap gap-1">
        {expert.skills?.map((s) => (
          <span key={s} className={`tag text-xs ${c.bg} ${c.text}`}>{s}</span>
        ))}
      </div>
    </div>
  );
}
