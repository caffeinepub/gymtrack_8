import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import {
  useLatestHealthMetric,
  usePersonalProfile,
  useWorkoutHistory,
  useWorkoutRoutine,
} from "../hooks/useQueries";

const _DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function DashboardPage() {
  const { data: routine, isLoading: routineLoading } = useWorkoutRoutine();
  const { data: profile, isLoading: profileLoading } = usePersonalProfile();
  const { data: latestMetric } = useLatestHealthMetric();
  const { data: workoutHistory } = useWorkoutHistory();

  const todayIdx = new Date().getDay();
  const todayWorkout = routine?.[todayIdx];
  const completedThisWeek =
    workoutHistory?.filter((w) => {
      const d = new Date(Number(w.date) / 1_000_000);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo && w.completed;
    }).length || 0;

  return (
    <div data-ocid="dashboard.page">
      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
        <img
          src="/assets/generated/gym-hero.dim_1200x500.jpg"
          alt="Gym"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(15,58,138,0.85) 0%, rgba(15,58,138,0.5) 60%, transparent 100%)",
          }}
        />
        <div className="relative z-10 p-8 flex items-center justify-between">
          <div className="max-w-md">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-white/80 text-sm font-medium mb-1">
                Good {getTimeOfDay()},
              </p>
              <h1 className="text-3xl font-bold text-white mb-3">
                Ready to crush today's workout?
              </h1>
              <p className="text-white/70 text-sm mb-6">
                {todayWorkout
                  ? `Today: ${todayWorkout.dayName} — ${todayWorkout.exercises.length} exercises`
                  : "Rest day — take care of your body!"}
              </p>
              <Link to="/workouts">
                <Button
                  size="lg"
                  className="font-bold"
                  data-ocid="dashboard.start_workout.primary_button"
                >
                  START TODAY'S WORKOUT
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Stats float card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="hidden lg:block bg-white/95 backdrop-blur rounded-xl p-5 min-w-[220px] shadow-xl"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              This Week
            </p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Workouts Done</span>
                  <span className="font-bold text-primary">
                    {completedThisWeek}/7
                  </span>
                </div>
                <Progress
                  value={(completedThisWeek / 7) * 100}
                  className="h-2"
                />
              </div>
              {profileLoading ? (
                <Skeleton className="h-8" />
              ) : (
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-warning" />
                  <div>
                    <p className="text-xs text-muted-foreground">Streak</p>
                    <p className="font-bold text-foreground">
                      {profile?.workoutStreak?.toString() || "0"} days
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
        {[
          {
            label: "Streak",
            value: profileLoading
              ? null
              : `${profile?.workoutStreak?.toString() || "0"} days`,
            icon: Flame,
            color: "text-warning",
          },
          {
            label: "Total Workouts",
            value: profileLoading
              ? null
              : `${profile?.totalWorkoutsCompleted?.toString() || "0"}`,
            icon: Dumbbell,
            color: "text-primary",
          },
          {
            label: "Heart Rate",
            value: latestMetric?.heartRateBpm
              ? `${latestMetric.heartRateBpm} bpm`
              : "—",
            icon: Heart,
            color: "text-destructive",
          },
          {
            label: "Steps Today",
            value: latestMetric?.stepsCount
              ? Number(latestMetric.stepsCount).toLocaleString()
              : "—",
            icon: TrendingUp,
            color: "text-success",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card
              className="shadow-card"
              data-ocid={`dashboard.${label.toLowerCase().replace(/ /g, "_")}.card`}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  {value === null ? (
                    <Skeleton className="h-5 w-16 mt-1" />
                  ) : (
                    <p className="font-bold text-foreground">{value}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-2 gap-6 px-6 pb-6">
        {/* Today's Routine */}
        <Card className="shadow-card" data-ocid="dashboard.routine.card">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">
              Today's Routine
            </CardTitle>
            <Link to="/workouts">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-primary text-xs"
                data-ocid="dashboard.view_workouts.link"
              >
                View All <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {routineLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : todayWorkout?.exercises.length ? (
              <div className="space-y-2">
                {todayWorkout.exercises.slice(0, 5).map((ex, i) => (
                  <div
                    key={ex.name}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    data-ocid={`dashboard.exercise.item.${i + 1}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {ex.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ex.sets.toString()} sets × {ex.reps.toString()} reps
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
                {todayWorkout.exercises.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{todayWorkout.exercises.length - 5} more exercises
                  </p>
                )}
              </div>
            ) : (
              <div
                className="text-center py-8 text-muted-foreground"
                data-ocid="dashboard.routine.empty_state"
              >
                <Dumbbell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Rest day — no exercises scheduled</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Demo Videos */}
        <Card className="shadow-card" data-ocid="dashboard.demos.card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">
              Exercise Demos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {routineLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            ) : todayWorkout?.exercises.filter((e) => e.videoUrl).slice(0, 2)
                .length ? (
              <div className="space-y-3">
                {todayWorkout.exercises
                  .filter((e) => e.videoUrl)
                  .slice(0, 2)
                  .map((ex, i) => (
                    <VideoCard key={ex.name} exercise={ex} index={i + 1} />
                  ))}
              </div>
            ) : (
              <div
                className="text-center py-8 text-muted-foreground"
                data-ocid="dashboard.demos.empty_state"
              >
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No video demos available today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function VideoCard({
  exercise,
  index,
}: { exercise: { name: string; videoUrl: string }; index: number }) {
  const youtubeId = getYouTubeId(exercise.videoUrl);
  return (
    <div
      className="rounded-lg overflow-hidden border border-border"
      data-ocid={`dashboard.demo.item.${index}`}
    >
      {youtubeId ? (
        <div className="relative" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={exercise.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="h-24 bg-muted flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Video unavailable</p>
        </div>
      )}
      <div className="p-2">
        <p className="text-xs font-medium truncate">{exercise.name}</p>
      </div>
    </div>
  );
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match?.[1] || null;
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
