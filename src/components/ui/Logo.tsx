interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
}

// The mark: two overlapping ripples forming an "E", echoing water/still-pool
// imagery used throughout the site as the wave-divider motif.
export default function Logo({ variant = "dark", className = "" }: LogoProps) {
  const stroke = variant === "light" ? "#FBF7F1" : "#33503F";
  const textColor = variant === "light" ? "text-sand-light" : "text-forest";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          d="M6 14C10 10 14 10 18 14C22 18 26 18 30 14"
          stroke={stroke}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M6 20C10 16 14 16 18 20C22 24 26 24 30 20"
          stroke={stroke}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M6 26C10 22 14 22 18 26C22 30 26 30 30 26"
          stroke={stroke}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
      <span className={`font-display text-xl tracking-wide ${textColor}`}>
        Elanova
      </span>
    </div>
  );
}
