import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Play,
  Plus,
  Timer,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Exercise } from "../backend.d";
import {
  useLogExerciseSet,
  useLoggedSets,
  useMarkExerciseCompleted,
  useTrackWorkoutCompletion,
  useWorkoutRoutine,
} from "../hooks/useQueries";

const _DAY_IDX = new Date().getDay();

export default function WorkoutsPage() {
  const { data: routine, isLoading } = useWorkoutRoutine();
  const { data: loggedSets } = useLoggedSets();
  const trackCompletion = useTrackWorkoutCompletion();
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(
    new Set(),
  );

  const todayWorkout = routine?.[_DAY_IDX];

  const handleCompleteWorkout = async () => {
    if (!todayWorkout) return;
    try {
      await trackCompletion.mutateAsync(todayWorkout.dayName);
      toast.success("Workout completed! Great work! 🎉");
    } catch {
      toast.error("Failed to save workout completion");
    }
  };

  const _allDone = todayWorkout
    ? todayWorkout.exercises.every((e) => completedExercises.has(e.name))
    : false;

  return (
    <div className="p-6" data-ocid="workouts.page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {todayWorkout?.dayName || "Today's Workout"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {todayWorkout
              ? `${todayWorkout.exercises.length} exercises scheduled`
              : "Loading..."}
          </p>
        </div>
        {todayWorkout && (
          <Button
            onClick={handleCompleteWorkout}
            disabled={trackCompletion.isPending}
            className="gap-2 font-semibold"
            data-ocid="workouts.complete_workout.primary_button"
          >
            {trackCompletion.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Complete Workout
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4" data-ocid="workouts.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : !todayWorkout?.exercises.length ? (
        <Card data-ocid="workouts.empty_state">
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-success mb-3" />
            <h3 className="font-bold text-lg mb-1">Rest Day!</h3>
            <p className="text-muted-foreground">
              No exercises scheduled today. Recovery is part of the process.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {todayWorkout.exercises.map((exercise, i) => (
            <ExerciseCard
              key={exercise.name}
              exercise={exercise}
              index={i + 1}
              loggedSets={
                loggedSets?.filter((s) => s.exerciseName === exercise.name) ||
                []
              }
              isCompleted={completedExercises.has(exercise.name)}
              onComplete={() =>
                setCompletedExercises(
                  (prev) => new Set([...prev, exercise.name]),
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ExerciseCard({
  exercise,
  index,
  loggedSets,
  isCompleted,
  onComplete,
}: {
  exercise: Exercise;
  index: number;
  loggedSets: Array<{
    exerciseName: string;
    actualReps: bigint;
    weightLbs: number;
    timestamp: bigint;
  }>;
  isCompleted: boolean;
  onComplete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const logSet = useLogExerciseSet();
  const markCompleted = useMarkExerciseCompleted();

  const youtubeId = getYouTubeId(exercise.videoUrl);

  const handleLogSet = async () => {
    if (!reps || !weight) {
      toast.error("Enter reps and weight");
      return;
    }
    try {
      await logSet.mutateAsync({
        exerciseName: exercise.name,
        reps: BigInt(reps),
        weight: Number.parseFloat(weight),
      });
      toast.success("Set logged!");
      setReps("");
      setWeight("");
    } catch {
      toast.error("Failed to log set");
    }
  };

  const handleMarkComplete = async () => {
    try {
      await markCompleted.mutateAsync(exercise.name);
      onComplete();
      toast.success(`${exercise.name} marked complete!`);
    } catch {
      toast.error("Failed to mark complete");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      data-ocid={`workouts.exercise.item.${index}`}
    >
      <Card
        className={`shadow-card transition-all ${isCompleted ? "border-success/40 bg-success/5" : ""}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5 ${
                  isCompleted
                    ? "bg-success text-white"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index}
              </div>
              <div>
                <CardTitle className="text-base">{exercise.name}</CardTitle>
                <div className="flex flex-wrap gap-1 mt-1">
                  {exercise.muscleGroups.map((mg) => (
                    <Badge key={mg} variant="secondary" className="text-xs">
                      {mg}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right">
                <p className="text-sm font-bold">
                  {exercise.sets.toString()} × {exercise.reps.toString()}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                  <Timer className="w-3 h-3" />
                  {exercise.restTimeSeconds.toString()}s rest
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(!expanded)}
                data-ocid={`workouts.exercise.expand.${index}.toggle`}
              >
                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <CardContent className="pt-0 space-y-4">
                {/* Instructions */}
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Instructions
                  </p>
                  <p className="text-sm">{exercise.instructions}</p>
                </div>

                {/* Video */}
                {youtubeId && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                      <Play className="w-3 h-3" /> Demo Video
                    </p>
                    <div
                      className="rounded-lg overflow-hidden"
                      style={{ paddingBottom: "56.25%", position: "relative" }}
                    >
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title={exercise.name}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* Logged Sets */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Logged Sets
                  </p>
                  {loggedSets.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Set</TableHead>
                          <TableHead className="text-xs">Reps</TableHead>
                          <TableHead className="text-xs">
                            Weight (lbs)
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loggedSets.map((s, i) => (
                          <TableRow
                            key={String(s.timestamp) + String(i)}
                            data-ocid={`workouts.set.row.${i + 1}`}
                          >
                            <TableCell className="text-sm">{i + 1}</TableCell>
                            <TableCell className="text-sm">
                              {s.actualReps.toString()}
                            </TableCell>
                            <TableCell className="text-sm">
                              {s.weightLbs}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No sets logged yet.
                    </p>
                  )}
                </div>

                {/* Log set form */}
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                    Log New Set
                  </p>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Label className="text-xs">Reps</Label>
                      <Input
                        type="number"
                        placeholder="12"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        className="mt-1"
                        data-ocid="workouts.reps.input"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs">Weight (lbs)</Label>
                      <Input
                        type="number"
                        placeholder="135"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="mt-1"
                        data-ocid="workouts.weight.input"
                      />
                    </div>
                    <Button
                      onClick={handleLogSet}
                      disabled={logSet.isPending}
                      className="gap-1"
                      data-ocid="workouts.log_set.submit_button"
                    >
                      {logSet.isPending ? (
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Add Set
                    </Button>
                  </div>
                </div>

                {/* Mark complete */}
                <Button
                  onClick={handleMarkComplete}
                  disabled={isCompleted || markCompleted.isPending}
                  variant={isCompleted ? "outline" : "default"}
                  className="w-full gap-2"
                  data-ocid={`workouts.mark_complete.${index}.button`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isCompleted ? "Completed ✓" : "Mark as Complete"}
                </Button>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match?.[1] || null;
}
