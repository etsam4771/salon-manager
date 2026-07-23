import { Link } from "react-router-dom";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-sand-light">
      <div className="hidden lg:flex flex-col justify-between bg-forest text-sand-light p-12">
        <Link to="/">
          <Logo variant="light" />
        </Link>
        <div>
          <p className="font-display italic text-2xl leading-relaxed max-w-sm">
            "The room remembers your pace, even when the week hasn't let you
            keep it."
          </p>
          <p className="mt-4 text-sm text-sand-light/60 font-mono">
            — A note from our front desk
          </p>
        </div>
        <svg viewBox="0 0 300 100" className="w-full max-w-xs" aria-hidden="true">
          <path d="M10 50C50 30 90 30 130 50C170 70 210 70 250 50C270 40 285 40 290 50" stroke="#D4B876" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10 flex justify-center">
            <Logo />
          </div>
          <h1 className="font-display text-3xl text-ink">Welcome back</h1>
          <p className="mt-2 text-ink/60 text-sm">
            Log in to manage your bookings and preferences.
          </p>

          <form className="mt-8 flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm text-ink/70">
                  Password
                </label>
                <a href="#" className="text-xs text-gold hover:underline">
                  Forgot?
                </a>
              </div>
              <input
                id="password"
                type="password"
                required
                className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" size="md" className="mt-2 w-full">
              Log in
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-ink/60">
            New to Elanova?{" "}
            <Link to="/register" className="text-forest font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
