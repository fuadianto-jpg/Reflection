import { Link, useLocation } from "react-router-dom";

export default function Topbar() {
  const { pathname } = useLocation();
  const active = (p: string) =>
    pathname === p ? "nav-link active" : "nav-link";

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link to="/" className="brand">
          <svg
            className="brand-mark"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 19V6a1 1 0 0 1 1-1h5a2 2 0 0 1 2 2v12" />
            <path d="M12 19V7a2 2 0 0 1 2-2h5a1 1 0 0 1 1 1v13" />
            <path d="M4 19h16" />
          </svg>
          <span>Reflection</span>
        </Link>
        <nav className="topbar-nav">
          <Link to="/apps" className={active("/apps")}>
            App
          </Link>
          <Link to="/admin" className={active("/admin")}>
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
