import type { ReactNode } from "react";
import type { IconType } from "react-icons";

interface EmptyStateProps {
  icon: IconType;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-full bg-sand flex items-center justify-center text-ink/40 mb-4">
        <Icon size={24} />
      </div>
      <p className="font-display text-lg text-ink">{title}</p>
      {subtitle && <p className="text-sm text-ink/50 mt-1 max-w-sm">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
