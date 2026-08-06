import { useMemo, useState } from "react";
import { HiOutlinePlus, HiOutlinePencil } from "react-icons/hi";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import Button from "../../components/ui/Button";
import { categoryNames, services } from "../../data/services";
import { formatCurrency } from "../../utils/format";

export default function AdminServicesPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(
    () =>
      activeCategory === "All" ? services : services.filter((s) => s.categoryName === activeCategory),
    [activeCategory]
  );

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Services"
        subtitle={`${services.length} services in your menu`}
        action={
          <Button size="sm" className="gap-1.5">
            <HiOutlinePlus /> Add service
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {categoryNames.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeCategory === c
                ? "bg-forest text-sand-light border-forest"
                : "border-blush text-ink/60 hover:border-forest/40"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-sand-light rounded-2xl border border-blush/60 p-6 flex flex-col gap-3 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wide text-gold">
                  {s.categoryName}
                </span>
                <h3 className="font-display text-lg text-ink mt-1">{s.name}</h3>
              </div>
              <button
                className="text-ink/40 hover:text-forest shrink-0"
                aria-label={`Edit ${s.name}`}
              >
                <HiOutlinePencil size={18} />
              </button>
            </div>

            <p className="text-sm text-ink/60 leading-relaxed">{s.description}</p>

            <div className="flex items-center gap-4 pt-3 border-t border-blush/40 text-sm">
              <span className="text-ink/70 font-mono">{s.durationMins} min</span>
              <span className="font-display text-lg text-forest ml-auto">{formatCurrency(s.price)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
