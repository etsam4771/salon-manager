import type { IconType } from "react-icons";

interface StatCardProps {
  label: string;
  value: string;
  icon: IconType;
  delta?: string;
}

export default function StatCard({ label, value, icon: Icon, delta }: StatCardProps) {
  return (
    <div className="bg-sand-light rounded-2xl p-6 border border-blush/60 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink/60">{label}</span>
        <div className="w-9 h-9 rounded-full bg-sand flex items-center justify-center text-forest">
          <Icon size={16} />
        </div>
      </div>
      <div>
        <p className="font-display text-3xl text-ink">{value}</p>
        {delta && <p className="text-xs text-gold font-mono mt-1">{delta}</p>}
      </div>
    </div>
  );
}
