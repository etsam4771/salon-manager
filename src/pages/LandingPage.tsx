import { Link } from "react-router-dom";
import { services } from "../data/services";
import Button from "../components/ui/Button";
import { HiOutlineArrowRight } from "react-icons/hi";
import WaveDivider from "../components/ui/WaveDivider";
import Section from "../components/ui/Section";

const featured = services.slice(0, 3);
const testimonials = [
  {
    quote:
      "I stopped checking my phone the moment I sat down. That hasn't happened at a salon before.",
    name: "Priya N.",
    visit: "Signature Facial",
  },
  {
    quote:
      "The hot stone therapist remembered exactly where I carry tension from my last visit, three months on.",
    name: "Rohan K.",
    visit: "Hot Stone Therapy",
  },
  {
    quote: "Best keratin treatment I've had — my hair still moves, it's just calmer now.",
    name: "Meera S.",
    visit: "Keratin Smoothing",
  },
];

export default function LandingPage() {
  return(
    <div>
       {/* Hero */}
       <section className="relative overflow-hidden bg-sand-light">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 pt-16 md:pt-24 pb-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-gold">
              Ranchi's quiet room
            </span>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.05] text-ink mt-4">
              Stillness, <span className="italic text-forest">restored</span>{" "}
              to the everyday.
            </h1>
            <p className="mt-6 text-ink/70 text-lg leading-relaxed max-w-md">
              Elanova blends unhurried spa rituals with precision hair and nail
              craft — one room, one therapist, your full attention for the
              length of your visit.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link to="/register">
                <Button size="lg">Book your visit</Button>
              </Link>
              <Link to="/services">
                <Button variant="ghost" size="lg" className="group">
                  View services
                  <HiOutlineArrowRight className="transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative h-80 md:h-[26rem]">
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full"
              aria-hidden="true"
            >
              <circle cx="200" cy="200" r="170" fill="#F1E8DA" />
              <path
                d="M60 160C100 130 140 130 180 160C220 190 260 190 300 160"
                stroke="#33503F"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M60 200C100 170 140 170 180 200C220 230 260 230 300 200"
                stroke="#33503F"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.7"
              />
              <path
                d="M60 240C100 210 140 210 180 240C220 270 260 270 300 240"
                stroke="#A9832F"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.9"
              />
              <path
                d="M60 280C100 250 140 250 180 280C220 310 260 310 300 280"
                stroke="#33503F"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.4"
              />
            </svg>
          </div>
        </div>
      </section>

      <WaveDivider from="#FBF7F1" to="#F1E8DA" />
      {/* Intro strip */}
      <Section bg="bg-sand">
        <div className="grid md:grid-cols-3 gap-10 text-center md:text-left">
          {[
            { label: "One therapist, one room", detail: "No shared spaces, no overlapping schedules." },
            { label: "12 years of craft", detail: "Trained across Bangkok, Bali, and Mumbai studios." },
            { label: "Botanical formulations", detail: "Small-batch products, mixed for your skin that day." },
          ].map((item) => (
            <div key={item.label}>
              <h3 className="font-display text-xl text-forest">{item.label}</h3>
              <p className="mt-2 text-sm text-ink/60 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Featured services */}
      <Section>
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-gold">
              A few favourites
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-ink mt-2">
              Rituals people return for
            </h2>
          </div>
          <Link to="/services" className="ripple-underline text-forest font-medium text-sm">
            See full menu →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {featured.map((s, i) => (
            <div
              key={s.id}
              className={`bg-sand p-8 border border-blush/60 ${
                i % 2 === 0
                  ? "rounded-tr-[48px] rounded-bl-[48px]"
                  : "rounded-tl-[48px] rounded-br-[48px]"
              }`}
            >
              <span className="font-mono text-xs uppercase tracking-wide text-gold">
                {s.category}
              </span>
              <h3 className="font-display text-xl text-ink mt-3">{s.name}</h3>
              <p className="text-sm text-ink/60 mt-3 leading-relaxed">{s.description}</p>
              <div className="flex items-center justify-between mt-6 text-sm">
                <span className="text-ink/50">{s.duration}</span>
                <span className="font-display text-forest text-lg">{s.price}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <WaveDivider from="#33503F" to="#FBF7F1" flip />

      {/* Testimonials */}
      <section className="bg-forest text-sand-light">
        <Section>
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-gold-light">
            In their words
          </span>
          <h2 className="font-display text-3xl md:text-4xl mt-2 mb-12">
            What a slower hour sounds like
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="border-l-2 border-gold-light/60 pl-6">
                <p className="font-display italic text-lg leading-relaxed text-sand-light/90">
                  "{t.quote}"
                </p>
                <p className="mt-4 text-sm text-sand-light/60 font-mono">
                  {t.name} · {t.visit}
                </p>
              </div>
            ))}
          </div>
        </Section>
      </section>

      <WaveDivider from="#33503F" to="#FBF7F1" flip />

      {/* CTA */}
      <Section className="text-center">
        <h2 className="font-display text-3xl md:text-4xl text-ink max-w-xl mx-auto">
          Your next hour of quiet is a few taps away.
        </h2>
        <div className="mt-8 flex justify-center">
          <Link to="/register">
            <Button size="lg">Reserve a time</Button>
          </Link>
        </div>
      </Section>
    </div>
  )
}