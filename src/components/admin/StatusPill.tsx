const styles: Record<string, string> = {
  Confirmed: "bg-forest/10 text-forest",
  "In progress": "bg-gold/15 text-gold",
  Pending: "bg-blush-dark/20 text-blush-dark",
  Completed: "bg-forest/10 text-forest",
  Cancelled: "bg-red-100 text-red-600",
  Active: "bg-forest/10 text-forest",
  Inactive: "bg-ink/10 text-ink/50",
};

export default function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
        styles[status] ?? "bg-ink/10 text-ink/60"
      }`}
    >
      {status}
    </span>
  );
}
