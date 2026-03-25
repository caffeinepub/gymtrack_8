import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DailyWorkoutCompletion,
  ExerciseDay,
  FitnessProfile,
  HealthMetric,
  InviteCode,
  LoggedSet,
  RSVP,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

export function useWorkoutRoutine() {
  const { actor, isFetching } = useActor();
  return useQuery<ExerciseDay[]>({
    queryKey: ["workoutRoutine"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWorkoutRoutine();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLoggedSets() {
  const { actor, isFetching } = useActor();
  return useQuery<LoggedSet[]>({
    queryKey: ["loggedSets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLoggedSets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useHealthMetricsHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<HealthMetric[]>({
    queryKey: ["healthMetrics"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHealthMetricsHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLatestHealthMetric() {
  const { actor, isFetching } = useActor();
  return useQuery<HealthMetric | null>({
    queryKey: ["latestHealthMetric"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLatestHealthMetric();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWorkoutHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<DailyWorkoutCompletion[]>({
    queryKey: ["workoutHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWorkoutHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePersonalProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<FitnessProfile | null>({
    queryKey: ["personalProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPersonalProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useInviteCodes() {
  const { actor, isFetching } = useActor();
  return useQuery<InviteCode[]>({
    queryKey: ["inviteCodes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInviteCodes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllRSVPs() {
  const { actor, isFetching } = useActor();
  return useQuery<RSVP[]>({
    queryKey: ["allRSVPs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRSVPs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGenerateInviteCode() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.generateInviteCode();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inviteCodes"] }),
  });
}

export function useSubmitRSVP() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      attending,
      inviteCode,
    }: { name: string; attending: boolean; inviteCode: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitRSVP(name, attending, inviteCode);
    },
  });
}

export function useLogExerciseSet() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      exerciseName,
      reps,
      weight,
    }: { exerciseName: string; reps: bigint; weight: number }) => {
      if (!actor) throw new Error("Not connected");
      return actor.logExerciseSet(exerciseName, reps, weight);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loggedSets"] }),
  });
}

export function useMarkExerciseCompleted() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (exerciseName: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.markExerciseCompleted(exerciseName);
    },
  });
}

export function useTrackWorkoutCompletion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (workoutName: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.trackWorkoutCompletion(workoutName);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workoutHistory"] });
      qc.invalidateQueries({ queryKey: ["personalProfile"] });
    },
  });
}

export function useLogHealthMetric() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (metric: HealthMetric) => {
      if (!actor) throw new Error("Not connected");
      return actor.logHealthMetric(metric);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["healthMetrics"] });
      qc.invalidateQueries({ queryKey: ["latestHealthMetric"] });
    },
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile"] }),
  });
}
