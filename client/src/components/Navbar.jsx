import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
        location.pathname === to
          ? "bg-brand-light text-brand-dark"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold text-gray-900 mr-2">
          <span className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center text-white text-xs font-bold">IF</span>
          <span className="hidden sm:block">IdeaForge</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLink("/", "Home")}
          {navLink("/feed", "Problems")}
          {user && navLink("/ai-hub", "AI Tools")}
          {user && navLink("/dashboard", "Dashboard")}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/post"
                className="btn-primary hidden sm:flex items-center gap-1.5"
              >
                <span className="text-base leading-none">+</span> Post Problem
              </Link>
              <div className="flex items-center gap-2">
                <Link to={`/profile/${user.id}`} className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-brand-light flex items-center justify-center text-brand-dark text-xs font-semibold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-medium text-gray-900 leading-none">{user.name}</p>
                    <p className="text-xs text-gray-400 leading-none mt-0.5">⬡ {user.points?.toLocaleString()} pts</p>
                  </div>
                </Link>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm">Log in</Link>
              <Link to="/register" className="btn-primary text-sm">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
