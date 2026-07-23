interface AdminPlaceholderPageProps {
  title: string;
}

export default function AdminPlaceholderPage({ title }: AdminPlaceholderPageProps) {
  return (
    <div className="bg-sand-light rounded-2xl border border-blush/60 p-10 md:p-16 text-center">
      <span className="font-mono text-xs tracking-[0.2em] uppercase text-gold">
        Coming soon
      </span>
      <h2 className="font-display text-2xl md:text-3xl text-ink mt-3">{title}</h2>
      <p className="mt-3 text-ink/60 max-w-md mx-auto">
        This section is wired into the navigation and ready for you to build
        out next.
      </p>
    </div>
  );
}
