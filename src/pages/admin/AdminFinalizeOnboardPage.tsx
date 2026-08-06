// FinalizeOnboardPage.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineCheck,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineCog,
  HiOutlineExternalLink,
  HiOutlinePlay,
} from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";
import { useSalonData } from "../../hooks/useSalonData";
import Button from "../../components/ui/Button";
// import Logo from "../components/ui/Logo";

interface OnboardingStatus {
  companyName: string;
  branchName: string;
  email: string;
  completedSteps: string[];
  pendingSteps: string[];
  isComplete: boolean;
}

const COMPLETION_STEPS = [
  { id: "profile", label: "Complete your profile", icon: HiOutlineUsers },
  { id: "services", label: "Add your services", icon: HiOutlineSparkles },
  { id: "schedule", label: "Set up your schedule", icon: HiOutlineCalendar },
  { id: "team", label: "Invite team members", icon: HiOutlineUsers },
];

const QUICK_ACTIONS = [
  { label: "Add Services", icon: HiOutlineSparkles, path: "/admin/services" },
  { label: "Manage Staff", icon: HiOutlineUsers, path: "/admin/staff" },
  { label: "View Bookings", icon: HiOutlineCalendar, path: "/admin/bookings" },
  { label: "Settings", icon: HiOutlineCog, path: "/admin/settings" },
];

export default function AdminFinalizeOnboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { salonProfile } = useSalonData();
  const [loading, setLoading] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    // Simulate fetching onboarding status
    const fetchOnboardingStatus = async () => {
      setLoading(true);
      try {
        const profile = salonProfile;

        // In a real app, this would come from your API
        const status: OnboardingStatus = {
          companyName: profile?.name || "Your Business",
          branchName: profile?.branches?.at(0)?.name || "Main Branch",
          email: user?.email || "",
          completedSteps: ["profile"], // Profile is already completed
          pendingSteps: ["services", "schedule", "team"],
          isComplete: false,
        };

        setOnboardingStatus(status);
        setCompletedSteps(status.completedSteps);
      } catch (error) {
        console.error("Failed to fetch onboarding status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingStatus();
  }, [user, salonProfile]);

  const handleCompleteStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      if (prev.includes(stepId)) return prev;
      return [...prev, stepId];
    });
  };

  const handleFinishOnboarding = () => {
    // Navigate to dashboard or main app
    navigate("/admin/dashboard");
  };

  const handleSkip = () => {
    // Skip to dashboard
    navigate("/admin/dashboard");
  };

  const getProgressPercentage = () => {
    const total = COMPLETION_STEPS.length;
    const completed = completedSteps.length;
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink/60">Loading your onboarding status...</p>
        </div>
      </div>
    );
  }

  const progress = getProgressPercentage();
  const isComplete = completedSteps.length === COMPLETION_STEPS.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sand-light to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex">
            {/* <Logo /> */}
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink/60">
              {user?.name || "User"}
            </span>
            <Button variant="secondary" size="sm" onClick={handleSkip}>
              Skip for now
            </Button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-white rounded-2xl border border-blush/60 p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
              <HiOutlineSparkles className="w-8 h-8 text-forest" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-3xl text-ink mb-2">
                Welcome to {onboardingStatus?.companyName}! 🎉
              </h1>
              <p className="text-ink/60">
                Your business is almost ready. Complete these final steps to start accepting bookings.
              </p>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-ink/60 mb-2">
                  <span>Setup progress</span>
                  <span className="font-medium text-ink">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-blush/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-forest rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {isComplete && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                  <HiOutlineCheck className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">
                    All steps complete! Your business is ready to go live.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Setup Steps */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-ink mb-4">
              Complete your setup
            </h2>
            <div className="space-y-4">
              {COMPLETION_STEPS.map((step, index) => {
                const isCompleted = completedSteps.includes(step.id);
                const Icon = step.icon;

                return (
                  <div
                    key={step.id}
                    className={`bg-white rounded-xl border p-5 transition-all ${isCompleted
                      ? "border-green-300 bg-green-50/50"
                      : "border-blush/60 hover:border-forest/30"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted
                          ? "bg-green-100 text-green-600"
                          : "bg-sand-light text-ink/40"
                          }`}>
                          {isCompleted ? (
                            <HiOutlineCheck className="w-5 h-5" />
                          ) : (
                            <span className="font-mono text-sm">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-ink">{step.label}</h3>
                          <p className="text-sm text-ink/50">
                            {isCompleted
                              ? "✓ Completed"
                              : "Get started with this step"}
                          </p>
                        </div>
                      </div>

                      {!isCompleted && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteStep(step.id)}
                          className="gap-1.5"
                        >
                          Start <HiOutlineArrowRight size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              {isComplete ? (
                <Button
                  onClick={handleFinishOnboarding}
                  className="gap-2 px-8"
                  size="lg"
                >
                  <HiOutlinePlay size={18} />
                  Go to Dashboard
                </Button>
              ) : (
                <Button
                  onClick={handleFinishOnboarding}
                  variant="secondary"
                  className="gap-2"
                >
                  Skip to Dashboard <HiOutlineArrowRight size={14} />
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-ink/60"
              >
                I'll do this later
              </Button>
            </div>
          </div>

          {/* Sidebar - Quick Actions & Tips */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-blush/60 p-5">
              <h3 className="font-medium text-ink mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      to={action.path}
                      className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg hover:bg-sand-light transition-colors group"
                    >
                      <span className="flex items-center gap-3 text-sm text-ink/70 group-hover:text-ink">
                        <Icon className="w-4 h-4 text-ink/40" />
                        {action.label}
                      </span>
                      <HiOutlineExternalLink className="w-4 h-4 text-ink/30 group-hover:text-ink/60" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-forest/5 to-forest/10 rounded-xl border border-forest/20 p-5">
              <h3 className="font-medium text-ink mb-3">💡 Pro Tips</h3>
              <ul className="space-y-3 text-sm text-ink/70">
                <li className="flex gap-2">
                  <span className="text-forest font-bold">•</span>
                  <span>Add high-quality photos of your space and services</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-forest font-bold">•</span>
                  <span>Set up your pricing and promotional offers</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-forest font-bold">•</span>
                  <span>Invite team members to manage bookings</span>
                </li>
              </ul>
            </div>

            {/* Company Info */}
            {onboardingStatus && (
              <div className="bg-white rounded-xl border border-blush/60 p-5">
                <h3 className="font-medium text-ink mb-3">Business Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink/50">Company</span>
                    <span className="text-ink font-medium">{onboardingStatus.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/50">Branch</span>
                    <span className="text-ink font-medium">{onboardingStatus.branchName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/50">Email</span>
                    <span className="text-ink font-medium">{onboardingStatus.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/50">Status</span>
                    <span className={`font-medium ${isComplete ? "text-green-600" : "text-amber-600"
                      }`}>
                      {isComplete ? "Ready ✓" : "In progress"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}