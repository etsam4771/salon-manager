import { useState } from "react";
import { Link } from "react-router-dom";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import { services, categoryNames } from "../data/services";
import { formatCurrency } from "../utils/format";

export default function ServicesPage() {
  const [active, setActive] = useState("All");

  const filtered =
    active === "All" ? services : services.filter((s) => s.categoryName === active);

  return (
    <div>
      <section className="bg-sand-light pt-16 md:pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-gold">
            The full menu
          </span>
          <h1 className="font-display text-4xl md:text-5xl text-ink mt-4">
            Services &amp; pricing
          </h1>
          <p className="mt-5 text-ink/70 text-lg leading-relaxed">
            Every session is one-on-one. Prices reflect the treatment only —
            consultations are always free.
          </p>
        </div>
      </section>

      <Section className="pt-0">
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categoryNames.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 rounded-full text-sm font-body transition-colors border ${
                active === cat
                  ? "bg-forest text-sand-light border-forest"
                  : "bg-transparent text-ink/60 border-blush hover:border-forest hover:text-forest"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="flex items-start justify-between gap-6 bg-sand p-7 rounded-tr-[36px] rounded-bl-[36px] border border-blush/60"
            >
              <div>
                <span className="font-mono text-xs uppercase tracking-wide text-gold">
                  {s.categoryName} · {s.durationMins} min
                </span>
                <h3 className="font-display text-xl text-ink mt-2">{s.name}</h3>
                <p className="text-sm text-ink/60 mt-2 leading-relaxed max-w-sm">
                  {s.description}
                </p>
              </div>
              <span className="font-display text-2xl text-forest shrink-0">{formatCurrency(s.price)}</span>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <p className="text-ink/60 mb-5">Ready to pick a time that suits you?</p>
          <Link to="/register">
            <Button size="lg">Book a visit</Button>
          </Link>
        </div>
      </Section>
    </div>
  );
}
