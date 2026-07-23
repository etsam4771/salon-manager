import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  bg?: string;
  id?: string;
}

export default function Section({ children, className = "", bg = "", id }: SectionProps) {
  return (
    <section id={id} className={`${bg} px-6 md:px-12 lg:px-20 py-16 md:py-24 ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}
