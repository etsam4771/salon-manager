import { HiOutlineWifi } from "react-icons/hi";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

export default function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div className="bg-gold text-ink text-sm px-6 py-2 flex items-center gap-2 justify-center">
      <HiOutlineWifi size={16} />
      You're offline. Changes made now will sync automatically once you're back online.
    </div>
  );
}
