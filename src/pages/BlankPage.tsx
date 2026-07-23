import Section from "../components/ui/Section";

// A minimal starting canvas — header and footer are already wired in via
// SiteLayout, so new pages only need their content dropped in here.
export default function BlankPage() {
  return (
    <Section className="min-h-[60vh] flex items-center justify-center text-center">
      <div>
        <span className="font-mono text-xs tracking-[0.2em] uppercase text-gold">
          Blank canvas
        </span>
        <h1 className="font-display text-3xl md:text-4xl text-ink mt-3">
          Start building here
        </h1>
        <p className="mt-3 text-ink/60 max-w-md mx-auto">
          This page keeps the site header and footer but leaves the middle
          empty — a clean base for a new page you add later.
        </p>
      </div>
    </Section>
  );
}
