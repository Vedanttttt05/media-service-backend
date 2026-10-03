import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router";
import { useCurrentUser, useAuth } from "../auth/AuthContext";
import { Avatar } from "./ui";
import {
  ChartIcon,
  HeartIcon,
  HistoryIcon,
  HomeIcon,
  ListIcon,
  LogoutIcon,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  UploadIcon,
  UserIcon,
  UsersIcon,
} from "./icons";

const NAV = [
  { to: "/", label: "Home", icon: HomeIcon, end: true },
  { to: "/subscriptions", label: "Subscriptions", icon: UsersIcon },
  { to: "/liked", label: "Liked videos", icon: HeartIcon },
  { to: "/history", label: "History", icon: HistoryIcon },
  { to: "/playlists", label: "Playlists", icon: ListIcon },
  { to: "/studio", label: "Studio", icon: ChartIcon },
];

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <div className="min-h-screen">
      <Header onMenu={() => setMenuOpen((o) => !o)} />
      <div className="flex">
        {menuOpen && (
          <div className="fixed inset-0 top-14 z-20 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} />
        )}
        <aside
          className={`fixed top-14 bottom-0 z-30 w-60 shrink-0 overflow-y-auto border-r border-border bg-bg p-3 transition-transform lg:sticky lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="flex flex-col gap-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-lg px-3 py-2 text-sm ${
                    isActive ? "bg-surface-2 font-medium" : "hover:bg-surface-2"
                  }`
                }
              >
                <Icon />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Header({ onMenu }: { onMenu: () => void }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");

  useEffect(() => setQuery(params.get("q") ?? ""), [params]);

  function search(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : "/");
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-bg/95 px-3 backdrop-blur sm:px-4">
      <button className="btn-ghost size-10 p-0 lg:hidden" onClick={onMenu} aria-label="Toggle menu">
        <MenuIcon />
      </button>
      <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
        <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-white">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path d="M7 4v16l13-8z" />
          </svg>
        </span>
        <span className="hidden sm:inline">StreamBox</span>
      </Link>

      <form onSubmit={search} className="mx-auto flex w-full max-w-xl" role="search">
        <input
          className="input rounded-r-none rounded-l-full"
          placeholder="Search videos"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search videos"
        />
        <button className="rounded-r-full border border-l-0 border-border bg-surface-2 px-4 hover:bg-border" aria-label="Search">
          <SearchIcon />
        </button>
      </form>

      <Link to="/upload" className="btn-secondary hidden sm:inline-flex">
        <UploadIcon /> Upload
      </Link>
      <UserMenu />
    </header>
  );
}

function UserMenu() {
  const user = useCurrentUser();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const item = "flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-surface-2";

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-label="Account menu" aria-expanded={open}>
        <Avatar src={user.avatar} name={user.username} size={34} />
      </button>
      {open && (
        <div className="card absolute right-0 mt-2 w-60 overflow-hidden py-2 shadow-lg" onClick={() => setOpen(false)}>
          <div className="flex items-center gap-3 border-b border-border px-4 pb-3">
            <Avatar src={user.avatar} name={user.username} />
            <div className="min-w-0">
              <p className="truncate font-medium">{user.fullName}</p>
              <p className="truncate text-sm text-muted">@{user.username}</p>
            </div>
          </div>
          <Link to={`/c/${user.username}`} className={`${item} mt-2`}>
            <UserIcon /> Your channel
          </Link>
          <Link to="/upload" className={item}>
            <UploadIcon /> Upload video
          </Link>
          <Link to="/settings" className={item}>
            <SettingsIcon /> Settings
          </Link>
          <button onClick={handleLogout} className={item}>
            <LogoutIcon /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
