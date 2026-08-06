import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import AdminHeader from "./AdminHeader";
import OfflineBanner from "../admin/OfflineBanner";
import CommandPalette from "../admin/CommandPalette";

const titles: Record<string, string> = {
  "/admin": "Overview",
  "/admin/bookings": "Bookings",
  "/admin/bookings/new": "New booking",
  "/admin/clients": "Clients",
  "/admin/services": "Services",
  "/admin/pos": "Billing / POS",
  "/admin/staff": "Staff",
  "/admin/inventory": "Inventory",
  "/admin/revenue": "Revenue",
  "/admin/reports": "Reports & Analytics",
  "/admin/marketing": "Marketing",
  "/admin/loyalty": "Loyalty & Memberships",
  "/admin/settings": "Settings",
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const { pathname } = useLocation();
  const title = titles[pathname] ?? "Admin";

  // Global Cmd+K / Ctrl+K shortcut for the search palette.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-sand">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <OfflineBanner />
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          onSearchClick={() => setCommandOpen(true)}
        />
        <main className="flex-1 p-6 md:p-10">
          <Outlet />
        </main>
      </div>
      {commandOpen && <CommandPalette onClose={() => setCommandOpen(false)} />}
    </div>
  );
}
