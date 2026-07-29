import { Link } from "react-router-dom";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import { useState, useCallback } from "react";
import type { RegisterCredentials } from "../types/auth";
import { authService } from "../api/services/auth.service";
import { isAxiosError } from "axios";
import type { ApiError } from "../utils/response";
import RegisterSuccess from "../components/ui/success/RegisterSuccess";

export default function RegisterPage() {
  const [usrCreds, setUsrCreds] = useState<RegisterCredentials>({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [register, setRegister] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ✅ Optimized handler
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setUsrCreds((prev) => ({
        ...prev,
        [id]: value,
      }));
    },
    []
  );

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await authService.register(usrCreds);
      // navigate("/login");
      setRegister(true);
    } catch (err: unknown) {
      if (isAxiosError<ApiError>(err) && err.response?.data) {
        setErrorMessage(err.response.data.message || "Registration failed");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {(register) ? <RegisterSuccess /> : null}
      <div className="min-h-screen grid lg:grid-cols-2 bg-sand-light">
        {/* LEFT */}
        <div className="flex items-center justify-center px-6 py-16 order-2 lg:order-1">
          <div className="w-full max-w-sm">
            <div className="lg:hidden mb-10 flex justify-center">
              <Logo />
            </div>

            <h1 className="font-display text-3xl text-ink">
              Create your account
            </h1>
            <p className="mt-2 text-ink/60 text-sm">
              Save your details once, book in seconds from here on.
            </p>

            {/* ✅ Stable error container (NO layout shift) */}
            <div className="mt-4 min-h-[48px]">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {errorMessage}
                </div>
              )}
            </div>

            <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit}>
              {/* NAME */}
              <div>
                <label htmlFor="name" className="text-sm text-ink/70">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  value={usrCreds.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors disabled:opacity-50"
                  placeholder="Ananya Verma"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label htmlFor="email" className="text-sm text-ink/70">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={usrCreds.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors disabled:opacity-50"
                  placeholder="you@example.com"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label htmlFor="password" className="text-sm text-ink/70">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={usrCreds.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors disabled:opacity-50"
                  placeholder="At least 8 characters"
                />
              </div>

              {/* CHECKBOX */}
              <label className="flex items-start gap-2 text-xs text-ink/60">
                <input
                  type="checkbox"
                  required
                  disabled={loading}
                  className="mt-0.5 accent-forest disabled:opacity-50"
                />
                I agree to receive booking confirmations by email and SMS.
              </label>

              {/* BUTTON */}
              <Button
                type="submit"
                size="md"
                className="mt-1 w-full"
                disabled={loading}
              >
                {/* ✅ fixed width to prevent jerk */}
                <span className="inline-block min-w-[160px] text-center">
                  {loading ? "Creating account..." : "Create account"}
                </span>
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-ink/60">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-forest font-medium hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT */}
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

          <svg
            viewBox="0 0 300 100"
            className="w-full max-w-xs self-end"
            aria-hidden="true"
          >
            <path
              d="M10 50C50 30 90 30 130 50C170 70 210 70 250 50C270 40 285 40 290 50"
              stroke="#D4B876"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </>
  );
}