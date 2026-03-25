import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CheckCircle2, Flame, Trophy, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { usePersonalProfile, useWorkoutHistory } from "../hooks/useQueries";

export default function HistoryPage() {
  const { data: history, isLoading: historyLoading } = useWorkoutHistory();
  const { data: profile, isLoading: profileLoading } = usePersonalProfile();

  const sorted = [...(history || [])].sort((a, b) => Number(b.date - a.date));
  const completed = sorted.filter((w) => w.completed).length;
  const total = sorted.length;

  return (
    <div className="p-6" data-ocid="history.page">
      <h1 className="text-2xl font-bold mb-6">Workout History</h1>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="shadow-card" data-ocid="history.streak.card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Streak</p>
              {profileLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-2xl font-bold">
                  {profile?.workoutStreak?.toString() || "0"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    days
                  </span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card" data-ocid="history.total.card">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Completed</p>
              {profileLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-2xl font-bold">
                  {profile?.totalWorkoutsCompleted?.toString() || "0"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    workouts
                  </span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card" data-ocid="history.completion_rate.card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
              <span className="text-sm font-bold">
                {total > 0 ? Math.round((completed / total) * 100) : 0}%
              </span>
            </div>
            <Progress
              value={total > 0 ? (completed / total) * 100 : 0}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {completed} of {total} sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* History list */}
      <Card className="shadow-card" data-ocid="history.list.card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Past Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-3" data-ocid="history.list.loading_state">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="history.list.empty_state"
            >
              <Calendar className="w-12 h-12 mx-auto opacity-30 mb-3" />
              <h3 className="font-semibold">No workout history yet</h3>
              <p className="text-sm mt-1">
                Complete your first workout to start tracking your progress!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((w, i) => (
                <motion.div
                  key={String(w.date) + String(i)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                  data-ocid={`history.workout.item.${i + 1}`}
                >
                  <div className="flex items-center gap-3">
                    {w.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-sm">{w.workoutName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(
                          Number(w.date) / 1_000_000,
                        ).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={w.completed ? "default" : "secondary"}
                    className={
                      w.completed
                        ? "bg-success/10 text-success border-success/20"
                        : ""
                    }
                  >
                    {w.completed ? "Completed" : "Missed"}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
