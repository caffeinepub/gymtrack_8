import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Exercise {
    name: string;
    reps: bigint;
    sets: bigint;
    instructions: string;
    muscleGroups: Array<MuscleGroup>;
    videoUrl: string;
    restTimeSeconds: bigint;
}
export interface CompletedExercise {
    date: Time;
    exerciseName: string;
}
export interface UserProfile {
    fitnessGoal: string;
    name: string;
}
export type Time = bigint;
export interface HealthMetric {
    bodyWeightLbs?: number;
    heartRateBpm?: bigint;
    stepsCount?: bigint;
    timestamp: Time;
    bloodPressureDiastolic?: bigint;
    caloriesBurned?: bigint;
    bloodPressureSystolic?: bigint;
}
export interface ExerciseDay {
    exercises: Array<Exercise>;
    dayName: string;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export interface DailyWorkoutCompletion {
    date: Time;
    completed: boolean;
    workoutName: string;
}
export interface MemberData {
    healthMetrics: Array<HealthMetric>;
    completedExercises: Array<CompletedExercise>;
    workoutCompletions: Array<DailyWorkoutCompletion>;
    loggedSets: Array<LoggedSet>;
    profile: FitnessProfile;
}
export interface LoggedSet {
    weightLbs: number;
    actualReps: bigint;
    timestamp: Time;
    exerciseName: string;
}
export interface FitnessProfile {
    totalWorkoutsCompleted: bigint;
    workoutStreak: bigint;
}
export enum MuscleGroup {
    shoulders = "shoulders",
    arms = "arms",
    back = "back",
    core = "core",
    chest = "chest",
    legs = "legs",
    cardio = "cardio"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminGetUserData(user: Principal): Promise<MemberData | null>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    generateInviteCode(): Promise<string>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHealthMetricsHistory(): Promise<Array<HealthMetric>>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getLatestHealthMetric(): Promise<HealthMetric | null>;
    getLoggedSets(): Promise<Array<LoggedSet>>;
    getPersonalProfile(): Promise<FitnessProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkoutHistory(): Promise<Array<DailyWorkoutCompletion>>;
    getWorkoutRoutine(): Promise<Array<ExerciseDay>>;
    isCallerAdmin(): Promise<boolean>;
    logExerciseSet(exerciseName: string, reps: bigint, weight: number): Promise<void>;
    logHealthMetric(metric: HealthMetric): Promise<void>;
    markExerciseCompleted(exerciseName: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    trackWorkoutCompletion(workoutName: string): Promise<void>;
}
