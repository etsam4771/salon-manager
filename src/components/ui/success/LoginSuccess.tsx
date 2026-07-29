import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button";

export default function LoginSuccess() {
  const navigate = useNavigate();

  // ✅ Auto redirect after 1.5s — login already knows where to send the user
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-light px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-sm w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-ink">Welcome back 👋</h2>

        <p className="text-sm text-ink/60 mt-2">
          You've successfully logged in. Redirecting you now.
        </p>

        <Button className="mt-6 w-full" onClick={() => navigate("/")}>
          Continue
        </Button>
      </div>
    </div>
  );
}
