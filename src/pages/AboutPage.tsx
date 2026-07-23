import Section from "../components/ui/Section";
import WaveDivider from "../components/ui/WaveDivider";

const values = [
  {
    title: "One room, one guest",
    detail:
      "No double-booked chairs, no passing conversations. Every treatment room holds a single appointment at a time.",
  },
  {
    title: "Ingredients you can name",
    detail:
      "Our estheticians mix small batches of botanical bases on-site — you'll always know what's on your skin.",
  },
  {
    title: "Trained hands, not scripts",
    detail:
      "Every therapist trains for a minimum of two years before joining Elanova, and keeps training after.",
  },
];

const team = [
  { name: "Ananya Verma", role: "Founder & Lead Esthetician", note: "12 years across Bangkok and Mumbai spas." },
  { name: "Devika Rao", role: "Senior Massage Therapist", note: "Specialises in deep tissue & hot stone work." },
  { name: "Kabir Sen", role: "Creative Hair Director", note: "Formerly styled for Mumbai fashion week shows." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-sand-light pt-16 md:pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-gold">
            Our story
          </span>
          <h1 className="font-display text-4xl md:text-5xl text-ink mt-4 leading-tight">
            Built around one idea: an hour that actually slows down.
          </h1>
          <p className="mt-6 text-ink/70 text-lg leading-relaxed">
            Elanova opened in 2019 with a single treatment room and a
            conviction that most salons rush the parts that matter. Today
            we're four rooms and a small, deliberately unhurried team — still
            holding to that same pace.
          </p>
        </div>
      </section>

      <WaveDivider from="#FBF7F1" to="#F1E8DA" />

      <Section bg="bg-sand">
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((v) => (
            <div key={v.title} className="bg-sand-light rounded-tr-[40px] rounded-bl-[40px] p-8 border border-blush/60">
              <h3 className="font-display text-xl text-forest">{v.title}</h3>
              <p className="mt-3 text-sm text-ink/60 leading-relaxed">{v.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-gold">
              The room itself
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-ink mt-2 leading-tight">
              Quiet by design, not by accident
            </h2>
            <p className="mt-5 text-ink/70 leading-relaxed">
              Low light, sound-dampened walls, and phones left at the door.
              We built Elanova the way we'd want to be treated: unrushed,
              listened to, and never asked to make small talk mid-massage.
            </p>
          </div>
          <div className="h-72 md:h-80">
            <svg viewBox="0 0 400 300" className="w-full h-full" aria-hidden="true">
              <rect width="400" height="300" rx="24" fill="#F1E8DA" />
              <path
                d="M40 100C90 70 140 70 190 100C240 130 290 130 340 100"
                stroke="#A9832F"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M40 150C90 120 140 120 190 150C240 180 290 180 340 150"
                stroke="#33503F"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                opacity="0.8"
              />
              <path
                d="M40 200C90 170 140 170 190 200C240 230 290 230 340 200"
                stroke="#33503F"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                opacity="0.5"
              />
            </svg>
          </div>
        </div>
      </Section>

      <WaveDivider from="#FBF7F1" to="#F1E8DA" />

      <Section bg="bg-sand">
        <span className="font-mono text-xs tracking-[0.2em] uppercase text-gold">
          The people
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-ink mt-2 mb-10">
          A small team, on purpose
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member) => (
            <div key={member.name} className="text-left">
              <div className="w-16 h-16 rounded-full bg-forest text-sand-light flex items-center justify-center font-display text-xl mb-4">
                {member.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <h3 className="font-display text-lg text-ink">{member.name}</h3>
              <p className="text-sm text-gold font-mono mt-1">{member.role}</p>
              <p className="text-sm text-ink/60 mt-2 leading-relaxed">{member.note}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
