import { Button } from "@/components/ui/button";
import { Dumbbell, Heart, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  const features = [
    {
      icon: Dumbbell,
      label: "Daily Workout Routines",
      desc: "Personalized plans for every muscle group",
    },
    {
      icon: Zap,
      label: "Set & Rep Tracking",
      desc: "Log every set with weight and reps",
    },
    {
      icon: Heart,
      label: "Health Metrics",
      desc: "Monitor heart rate, steps, and calories",
    },
    {
      icon: TrendingUp,
      label: "Progress History",
      desc: "Track your fitness journey over time",
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #0f3a8a 0%, #1E73E8 60%, #5ba3f5 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-background rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl"
      >
        <div className="grid md:grid-cols-2">
          {/* Left panel */}
          <div
            className="p-10 flex flex-col justify-between"
            style={{
              background: "linear-gradient(135deg, #0f3a8a 0%, #1E73E8 100%)",
            }}
          >
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">GymTrack</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">
                Your fitness journey starts here
              </h1>
              <p className="text-white/70 text-base">
                Track workouts, monitor health metrics, and achieve your goals.
              </p>
            </div>
            <div className="mt-8 space-y-4">
              {features.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{label}</p>
                    <p className="text-white/60 text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="p-10 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome back
              </h2>
              <p className="text-muted-foreground mb-8">
                Sign in to access your fitness dashboard
              </p>
              <Button
                onClick={login}
                disabled={isLoggingIn}
                size="lg"
                className="w-full font-semibold"
                data-ocid="login.primary_button"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In to GymTrack"
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-6">
                Secure authentication powered by Internet Identity
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
