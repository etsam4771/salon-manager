import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import AdminHeader from "./AdminHeader"; 

const titles: Record<string, string> = {
  "/admin": "Overview",
  "/admin/bookings": "Bookings",
  "/admin/clients": "Clients",
  "/admin/services": "Services",
  "/admin/revenue": "Revenue",
  "/admin/settings": "Settings",
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const title = titles[pathname] ?? "Admin";

  return (
    <div className="flex min-h-screen bg-sand">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
