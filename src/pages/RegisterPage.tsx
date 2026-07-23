import { Link } from "react-router-dom";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-sand-light">
      <div className="flex items-center justify-center px-6 py-16 order-2 lg:order-1">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10 flex justify-center">
            <Logo />
          </div>
          <h1 className="font-display text-3xl text-ink">Create your account</h1>
          <p className="mt-2 text-ink/60 text-sm">
            Save your details once, book in seconds from here on.
          </p>

          <form className="mt-8 flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="name" className="text-sm text-ink/70">
                Full name
              </label>
              <input
                id="name"
                type="text"
                required
                className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors"
                placeholder="Ananya Verma"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm text-ink/70">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="text-sm text-ink/70">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                required
                className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm text-ink/70">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors"
                placeholder="At least 8 characters"
              />
            </div>

            <label className="flex items-start gap-2 text-xs text-ink/60">
              <input type="checkbox" required className="mt-0.5 accent-forest" />
              I agree to receive booking confirmations by email and SMS.
            </label>

            <Button type="submit" size="md" className="mt-1 w-full">
              Create account
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-ink/60">
            Already have an account?{" "}
            <Link to="/login" className="text-forest font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-col justify-between bg-forest text-sand-light p-12 order-1 lg:order-2">
        <Link to="/" className="self-end">
          <Logo variant="light" />
        </Link>
        <div className="self-end text-right">
          <p className="font-display italic text-2xl leading-relaxed max-w-sm ml-auto">
            "First-time guests get a five minute consultation, on the house —
            no obligation to book anything after."
          </p>
        </div>
        <svg viewBox="0 0 300 100" className="w-full max-w-xs self-end" aria-hidden="true">
          <path d="M10 50C50 30 90 30 130 50C170 70 210 70 250 50C270 40 285 40 290 50" stroke="#D4B876" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
