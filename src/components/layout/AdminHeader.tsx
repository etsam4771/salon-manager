import { HiOutlineMenu, HiOutlineBell, HiOutlineSearch } from "react-icons/hi";

interface AdminHeaderProps {
  onMenuClick: () => void;
  title: string;
}

export default function AdminHeader({ onMenuClick, title }: AdminHeaderProps) {
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
        <div className="hidden sm:flex items-center gap-2 bg-sand rounded-full px-4 py-2 w-64">
          <HiOutlineSearch className="text-ink/40" />
          <input
            type="text"
            placeholder="Search clients, bookings…"
            className="bg-transparent outline-none text-sm w-full placeholder:text-ink/40"
          />
        </div>
        <button className="relative text-ink/70 hover:text-forest" aria-label="Notifications">
          <HiOutlineBell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold" />
        </button>
        <div className="w-9 h-9 rounded-full bg-forest text-sand-light flex items-center justify-center font-display text-sm">
          AM
        </div>
      </div>
    </header>
  );
}
