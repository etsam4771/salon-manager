import { useState } from "react";
import { HiOutlineLogout } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import Button from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";

export default function AdminSettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const [salonName, setSalonName] = useState("Elanova");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("20:00");
  const [notifyBookings, setNotifyBookings] = useState(true);
  const [notifyCancellations, setNotifyCancellations] = useState(true);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // No settings endpoint exists yet — persisting locally so the form
    // is fully wired once the backend route is available.
    setSavedAt(new Date().toLocaleTimeString());
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <AdminPageHeader title="Settings" subtitle="Salon details and your account" />

      <section className="bg-sand-light rounded-2xl border border-blush/60 p-6 md:p-8">
        <h2 className="font-display text-xl text-ink mb-1">Your account</h2>
        <p className="text-sm text-ink/60 mb-6">Signed in as an administrator.</p>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-forest text-sand-light flex items-center justify-center font-display text-base">
              {(user?.name ?? "?")
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-ink">{user?.name ?? "Unknown admin"}</p>
              <p className="text-sm text-ink/60">{user?.email}</p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <HiOutlineLogout /> {loggingOut ? "Logging out…" : "Log out"}
          </Button>
        </div>
      </section>

      <form
        onSubmit={handleSave}
        className="bg-sand-light rounded-2xl border border-blush/60 p-6 md:p-8 flex flex-col gap-6"
      >
        <div>
          <h2 className="font-display text-xl text-ink mb-1">Salon details</h2>
          <p className="text-sm text-ink/60">Shown to clients on the booking site.</p>
        </div>

        <div>
          <label htmlFor="salonName" className="text-sm text-ink/70">
            Salon name
          </label>
          <input
            id="salonName"
            value={salonName}
            onChange={(e) => setSalonName(e.target.value)}
            className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="openTime" className="text-sm text-ink/70">
              Opens at
            </label>
            <input
              id="openTime"
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors"
            />
          </div>
          <div>
            <label htmlFor="closeTime" className="text-sm text-ink/70">
              Closes at
            </label>
            <input
              id="closeTime"
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink/70">Notifications</p>
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={notifyBookings}
              onChange={(e) => setNotifyBookings(e.target.checked)}
              className="accent-forest"
            />
            Email me for every new booking
          </label>
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={notifyCancellations}
              onChange={(e) => setNotifyCancellations(e.target.checked)}
              className="accent-forest"
            />
            Email me when a client cancels
          </label>
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" size="md">
            Save changes
          </Button>
          {savedAt && <span className="text-xs text-ink/50 font-mono">Saved at {savedAt}</span>}
        </div>
      </form>
    </div>
  );
}
