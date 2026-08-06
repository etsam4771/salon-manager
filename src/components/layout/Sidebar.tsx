import { NavLink } from "react-router-dom";
import {
  HiOutlineViewGrid,
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineSparkles,
  HiOutlineCurrencyRupee,
  HiOutlineCog,
  HiOutlineX,
  HiOutlineCreditCard,
  HiOutlineUserGroup,
  HiOutlineArchive,
  HiOutlineChartBar,
  HiOutlineSpeakerphone,
  HiOutlineHeart,
} from "react-icons/hi";
import Logo from "../ui/Logo";

const links = [
  { label: "Overview", to: "/admin", icon: HiOutlineViewGrid, end: true },
  { label: "Bookings", to: "/admin/bookings", icon: HiOutlineCalendar },
  { label: "Clients", to: "/admin/clients", icon: HiOutlineUsers },
  { label: "Services", to: "/admin/services", icon: HiOutlineSparkles },
  { label: "Billing / POS", to: "/admin/pos", icon: HiOutlineCreditCard },
  { label: "Staff", to: "/admin/staff", icon: HiOutlineUserGroup },
  { label: "Inventory", to: "/admin/inventory", icon: HiOutlineArchive },
  { label: "Revenue", to: "/admin/revenue", icon: HiOutlineCurrencyRupee },
  { label: "Reports", to: "/admin/reports", icon: HiOutlineChartBar },
  { label: "Marketing", to: "/admin/marketing", icon: HiOutlineSpeakerphone },
  { label: "Loyalty", to: "/admin/loyalty", icon: HiOutlineHeart },
  { label: "Settings", to: "/admin/settings", icon: HiOutlineCog },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-ink/40 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-forest-dark text-sand-light/85 z-40
        flex flex-col shrink-0 transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-sand-light/10">
          <Logo variant="light" />
          <button className="lg:hidden text-sand-light/70" onClick={onClose} aria-label="Close sidebar">
            <HiOutlineX size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
          {links.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-body transition-colors ${
                  isActive
                    ? "bg-sand-light/10 text-gold-light font-medium"
                    : "hover:bg-sand-light/5 text-sand-light/70"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-sand-light/10 text-xs text-sand-light/40 font-mono">
          Elanova Admin · v1.0
        </div>
      </aside>
    </>
  );
}
