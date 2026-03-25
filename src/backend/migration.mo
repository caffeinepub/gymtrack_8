import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type MuscleGroup = {
    #chest;
    #back;
    #shoulders;
    #legs;
    #arms;
    #core;
    #cardio;
  };

  type Exercise = {
    name : Text;
    muscleGroups : [MuscleGroup];
    sets : Nat;
    reps : Nat;
    restTimeSeconds : Nat;
    videoUrl : Text;
    instructions : Text;
  };

  type ExerciseDay = {
    dayName : Text;
    exercises : [Exercise];
  };

  type LoggedSet = {
    exerciseName : Text;
    actualReps : Nat;
    weightLbs : Float;
    timestamp : Time.Time;
  };

  type CompletedExercise = {
    exerciseName : Text;
    date : Time.Time;
  };

  type DailyWorkoutCompletion = {
    date : Time.Time;
    workoutName : Text;
    completed : Bool;
  };

  type HealthMetric = {
    timestamp : Time.Time;
    heartRateBpm : ?Nat;
    stepsCount : ?Nat;
    caloriesBurned : ?Nat;
    bodyWeightLbs : ?Float;
    bloodPressureSystolic : ?Nat;
    bloodPressureDiastolic : ?Nat;
  };

  type FitnessProfile = {
    workoutStreak : Nat;
    totalWorkoutsCompleted : Nat;
  };

  public type UserProfile = {
    name : Text;
    fitnessGoal : Text;
  };

  type MemberData = {
    loggedSets : [LoggedSet];
    completedExercises : [CompletedExercise];
    workoutCompletions : [DailyWorkoutCompletion];
    healthMetrics : [HealthMetric];
    profile : FitnessProfile;
  };

  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    memberData : Map.Map<Principal, MemberData>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    memberData : Map.Map<Principal, MemberData>;
    userProfiles : Map.Map<Principal, UserProfile>;
    inviteState : InviteLinksModule.InviteLinksSystemState;
  };

  public func run(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      memberData = old.memberData;
      userProfiles = old.userProfiles;
      inviteState = InviteLinksModule.initState();
    };
  };
};
