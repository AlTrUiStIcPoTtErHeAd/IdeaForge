import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ProblemCard from "../components/ProblemCard";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["Tech", "Environment", "Health", "Education", "Social", "Business"];
const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Voted" },
  { value: "solutions", label: "Most Solutions" },
  { value: "deadline", label: "Deadline Soon" },
];

export default function Feed() {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ problems: 0, solutions: 0, contributors: 0 });

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = { sort, page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (status) params.status = status;
      const { data } = await api.get("/problems", { params });
      setProblems(data.problems);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/problems/stats");
      setStats(data);
    } catch (e) {
      console.error("Failed to fetch platform stats", e);
    }
  };

  useEffect(() => { fetchProblems(); }, [search, category, sort, status, page]);
  useEffect(() => { fetchStats(); }, []);

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="fade-in">
      {/* Hero / Header */}
      <div className="text-center py-10 mb-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-light text-brand-dark text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          ✦ AI-Powered Collaborative Problem Solving
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
          Community <span className="text-brand">Problem Feed</span>
        </h1>
        <p className="text-gray-500 text-lg mx-auto mb-6">
          Browse challenges, submit solutions, and earn XP. Join the innovation cycle.
        </p>
        
        {/* Real-time Stats bar */}
        <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-400 bg-white shadow-sm border border-gray-100 rounded-2xl py-6 px-10">
          <div className="text-center">
            <div className="text-gray-900 font-bold text-2xl">{stats.problems}</div>
            <div className="text-xs uppercase tracking-wider font-medium text-gray-400">problems</div>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="text-center">
            <div className="text-gray-900 font-bold text-2xl">{stats.solutions}</div>
            <div className="text-xs uppercase tracking-wider font-medium text-gray-400">solutions</div>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="text-center">
            <div className="text-gray-900 font-bold text-2xl">{stats.contributors}</div>
            <div className="text-xs uppercase tracking-wider font-medium text-gray-400">contributors</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 sticky top-20 z-10 bg-gray-50/90 backdrop-blur-sm py-2">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search problems..."
            className="input pl-10"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="input w-auto font-medium"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="flex bg-white border border-gray-200 rounded-lg p-1">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => { setSort(s.value); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                sort === s.value ? "bg-brand text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full spin" />
        </div>
      ) : problems.length === 0 ? (
        <div className="card p-20 text-center text-gray-400 border-dashed border-2">
          <p className="text-6xl mb-6">🏜️</p>
          <p className="text-xl font-bold text-gray-900 mb-2">No problems found</p>
          <p className="text-sm max-w-xs mx-auto mb-8">Try different keywords or be the pioneer who posts the first challenge in this category.</p>
          <Link to="/post" className="btn-primary px-8 py-3 text-base inline-flex items-center gap-2">
            <span>+</span> Post a Problem
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((p) => <ProblemCard key={p._id} problem={p} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-12 pb-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary px-4 py-2 disabled:opacity-30 flex items-center gap-2"
          >
            ← Previous
          </button>
          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${page === i + 1 ? "bg-brand text-white" : "hover:bg-gray-200 text-gray-500"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary px-4 py-2 disabled:opacity-30 flex items-center gap-2"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
