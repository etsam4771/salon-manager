import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button";

export default function RegisterSuccess() {
  const navigate = useNavigate();

  // ✅ Auto redirect to login after 2.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-light px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-sm w-full text-center">

        {/* ✅ Success Icon */}
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

        {/* ✅ Title */}
        <h2 className="text-xl font-semibold text-ink">
          Account Created 🎉
        </h2>

        {/* ✅ Description */}
        <p className="text-sm text-ink/60 mt-2">
          Your account has been successfully created.
          You can now log in and start booking.
        </p>

        {/* ✅ Action Button */}
        <Button
          className="mt-6 w-full"
          onClick={() => navigate("/login")}
        >
          Go to Login
        </Button>
      </div>
    </div>
  );
}