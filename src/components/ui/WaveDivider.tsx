interface WaveDividerProps {
  from?: string;
  to?: string;
  flip?: boolean;
}

// Signature transition element: a still-water ripple line that separates
// sections, standing in for the calm/flow the spa promises.
export default function WaveDivider({
  from = "#FBF7F1",
  to = "#F1E8DA",
  flip = false,
}: WaveDividerProps) {
  return (
    <div
      className={`w-full overflow-hidden leading-none ${flip ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 80"
        className="w-full h-[50px] md:h-[70px]"
        preserveAspectRatio="none"
      >
        <rect width="1440" height="80" fill={from} />
        <path
          d="M0 40C120 10 240 10 360 40C480 70 600 70 720 40C840 10 960 10 1080 40C1200 70 1320 70 1440 40V80H0V40Z"
          fill={to}
        />
      </svg>
    </div>
  );
}
