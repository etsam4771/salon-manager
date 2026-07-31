import { HiOutlineMenu, HiOutlineBell, HiOutlineSearch } from "react-icons/hi";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface AdminHeaderProps {
  onMenuClick: () => void;
  title: string;
  onSearchClick: () => void;
}

function initialsFor(name: string | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AdminHeader({ onMenuClick, title, onSearchClick }: AdminHeaderProps) {
  const { user } = useAuth();
  return (
    <header className="h-20 bg-sand-light/95 backdrop-blur-sm border-b border-blush sticky top-0 z-20 flex items-center justify-between px-6 md:px-10">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden text-forest text-xl"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <HiOutlineMenu />
        </button>
        <h1 className="font-display text-xl md:text-2xl text-ink">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onSearchClick}
          className="hidden sm:flex items-center gap-2 bg-sand rounded-full px-4 py-2 w-64 text-left"
        >
          <HiOutlineSearch className="text-ink/40 shrink-0" />
          <span className="text-sm text-ink/40 flex-1">Search clients, bookings…</span>
          <kbd className="text-[10px] font-mono text-ink/40 border border-ink/15 rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </button>
        <button className="relative text-ink/70 hover:text-forest" aria-label="Notifications">
          <HiOutlineBell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold" />
        </button>
        <Link
          to="/admin/settings"
          className="w-9 h-9 rounded-full bg-forest text-sand-light flex items-center justify-center font-display text-sm"
          title={user?.name ?? "Account"}
        >
          {initialsFor(user?.name)}
        </Link>
      </div>
    </header>
  );
}
