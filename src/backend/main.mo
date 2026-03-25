import Migration "migration";
import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Random "mo:core/Random";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";

(with migration = Migration.run)
actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();

  // Invite links system state
  let inviteState = InviteLinksModule.initState();

  include MixinAuthorization(accessControlState);

  // Exercise Types
  type MuscleGroup = { #chest; #back; #shoulders; #legs; #arms; #core; #cardio };

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

  // Workout Logging
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

  // Health Metrics
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

  // User Profile Type
  public type UserProfile = {
    name : Text;
    fitnessGoal : Text;
  };

  // State
  type MemberData = {
    loggedSets : [LoggedSet];
    completedExercises : [CompletedExercise];
    workoutCompletions : [DailyWorkoutCompletion];
    healthMetrics : [HealthMetric];
    profile : FitnessProfile;
  };

  let memberData = Map.empty<Principal, MemberData>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  module CompletionEntry {
    public func compare(a : DailyWorkoutCompletion, b : DailyWorkoutCompletion) : Order.Order {
      Int.compare(b.date, a.date);
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Immutable Prefab Data - 7 Day Split (accessible to all including guests)
  public query ({ caller }) func getWorkoutRoutine() : async [ExerciseDay] {
    [
      {
        dayName = "Push Day";
        exercises = [
          { name = "Bench Press"; muscleGroups = [#chest]; sets = 4; reps = 8; restTimeSeconds = 90; videoUrl = "https://www.youtube.com/watch?v=gRVjAtPip0Y"; instructions = "Lie on bench, lower bar to chest, press up." },
          { name = "Overhead Press"; muscleGroups = [#shoulders]; sets = 4; reps = 10; restTimeSeconds = 90; videoUrl = "https://www.youtube.com/watch?v=2yjwXTZQDDI"; instructions = "Press bar overhead, lock out elbows." },
          { name = "Incline Dumbbell Press"; muscleGroups = [#chest]; sets = 3; reps = 12; restTimeSeconds = 60; videoUrl = "https://www.youtube.com/watch?v=8iPEnn-ltC8"; instructions = "Press dumbbells on incline bench." },
          { name = "Tricep Dips"; muscleGroups = [#arms]; sets = 3; reps = 12; restTimeSeconds = 60; videoUrl = "https://www.youtube.com/watch?v=2z8JmcrW-As"; instructions = "Lower body between parallel bars, push up." },
        ];
      },
      {
        dayName = "Pull Day";
        exercises = [
          { name = "Barbell Row"; muscleGroups = [#back]; sets = 4; reps = 8; restTimeSeconds = 90; videoUrl = "https://www.youtube.com/watch?v=FWJR5Ve8bnQ"; instructions = "Pull bar to lower chest, keep back straight." },
          { name = "Lat Pulldown"; muscleGroups = [#back]; sets = 4; reps = 10; restTimeSeconds = 90; videoUrl = "https://www.youtube.com/watch?v=CAwf7n6Luuc"; instructions = "Pull bar to chest, squeeze back at bottom." },
          { name = "Face Pulls"; muscleGroups = [#shoulders]; sets = 3; reps = 15; restTimeSeconds = 60; videoUrl = "https://www.youtube.com/watch?v=rep-qVOkqgk"; instructions = "Pull rope to face, external rotation." },
          { name = "Bicep Curls"; muscleGroups = [#arms]; sets = 3; reps = 12; restTimeSeconds = 60; videoUrl = "https://www.youtube.com/watch?v=ykJmrZ5v0Oo"; instructions = "Curl dumbbells to shoulders, control descent." },
        ];
      },
      {
        dayName = "Leg Day";
        exercises = [
          { name = "Barbell Squat"; muscleGroups = [#legs]; sets = 4; reps = 8; restTimeSeconds = 120; videoUrl = "https://www.youtube.com/watch?v=ultWZbUMPL8"; instructions = "Squat down, keep chest up, drive through heels." },
          { name = "Romanian Deadlift"; muscleGroups = [#legs]; sets = 4; reps = 10; restTimeSeconds = 90; videoUrl = "https://www.youtube.com/watch?v=2SHsk9AzdjA"; instructions = "Hinge at hips, lower bar along legs." },
          { name = "Leg Press"; muscleGroups = [#legs]; sets = 3; reps = 12; restTimeSeconds = 90; videoUrl = "https://www.youtube.com/watch?v=IZxyjW7MPJQ"; instructions = "Press platform with feet, full range of motion." },
          { name = "Calf Raises"; muscleGroups = [#legs]; sets = 4; reps = 15; restTimeSeconds = 60; videoUrl = "https://www.youtube.com/watch?v=gwLzBJYoWlI"; instructions = "Raise heels, squeeze calves at top." },
        ];
      },
      {
        dayName = "Rest Day";
        exercises = [];
      },
    ];
  };

  // Log Exercise Set with Authorization Check
  public shared ({ caller }) func logExerciseSet(exerciseName : Text, reps : Nat, weight : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log exercise sets");
    };

    let set : LoggedSet = {
      exerciseName;
      actualReps = reps;
      weightLbs = weight;
      timestamp = Time.now();
    };

    let existing = switch (memberData.get(caller)) {
      case (null) { { loggedSets = []; completedExercises = []; workoutCompletions = []; healthMetrics = []; profile = { workoutStreak = 0; totalWorkoutsCompleted = 0 } } };
      case (?data) { data };
    };

    let newLoggedSets = existing.loggedSets.concat([set]);
    let newMemberData : MemberData = {
      loggedSets = newLoggedSets;
      completedExercises = existing.completedExercises;
      workoutCompletions = existing.workoutCompletions;
      healthMetrics = existing.healthMetrics;
      profile = existing.profile;
    };
    memberData.add(caller, newMemberData);
  };

  // Mark Exercise as Completed with Authorization Check
  public shared ({ caller }) func markExerciseCompleted(exerciseName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark exercises as completed");
    };

    let completed : CompletedExercise = {
      exerciseName;
      date = Time.now();
    };

    let existing = switch (memberData.get(caller)) {
      case (null) { { loggedSets = []; completedExercises = []; workoutCompletions = []; healthMetrics = []; profile = { workoutStreak = 0; totalWorkoutsCompleted = 0 } } };
      case (?data) { data };
    };

    let newCompleted = existing.completedExercises.concat([completed]);
    let newMemberData : MemberData = {
      loggedSets = existing.loggedSets;
      completedExercises = newCompleted;
      workoutCompletions = existing.workoutCompletions;
      healthMetrics = existing.healthMetrics;
      profile = existing.profile;
    };
    memberData.add(caller, newMemberData);
  };

  // Get All Logged Sets for Caller
  public query ({ caller }) func getLoggedSets() : async [LoggedSet] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view logged sets");
    };
    switch (memberData.get(caller)) {
      case (null) { [] };
      case (?data) { data.loggedSets };
    };
  };

  // Log Health Metric with Authorization Check
  public shared ({ caller }) func logHealthMetric(metric : HealthMetric) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log health metrics");
    };

    let existing = switch (memberData.get(caller)) {
      case (null) { { loggedSets = []; completedExercises = []; workoutCompletions = []; healthMetrics = []; profile = { workoutStreak = 0; totalWorkoutsCompleted = 0 } } };
      case (?data) { data };
    };

    let newMetrics = existing.healthMetrics.concat([metric]);
    let newMemberData : MemberData = {
      loggedSets = existing.loggedSets;
      completedExercises = existing.completedExercises;
      workoutCompletions = existing.workoutCompletions;
      healthMetrics = newMetrics;
      profile = existing.profile;
    };
    memberData.add(caller, newMemberData);
  };

  // Get Latest Health Metric
  public query ({ caller }) func getLatestHealthMetric() : async ?HealthMetric {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view health metrics");
    };
    switch (memberData.get(caller)) {
      case (null) { null };
      case (?data) {
        if (data.healthMetrics.size() > 0) {
          ?data.healthMetrics[0];
        } else {
          null;
        };
      };
    };
  };

  // Get All Health Metrics History
  public query ({ caller }) func getHealthMetricsHistory() : async [HealthMetric] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view health metrics history");
    };
    switch (memberData.get(caller)) {
      case (null) { [] };
      case (?data) { data.healthMetrics };
    };
  };

  // Track Workout Completion with Authorization Check
  public shared ({ caller }) func trackWorkoutCompletion(workoutName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can track workout completion");
    };

    let completion : DailyWorkoutCompletion = {
      date = Time.now();
      workoutName;
      completed = true;
    };

    let existing = switch (memberData.get(caller)) {
      case (null) { { loggedSets = []; completedExercises = []; workoutCompletions = []; healthMetrics = []; profile = { workoutStreak = 0; totalWorkoutsCompleted = 0 } } };
      case (?data) { data };
    };

    let newCompletions = existing.workoutCompletions.concat([completion]);
    let newProfile : FitnessProfile = {
      workoutStreak = existing.profile.workoutStreak + 1;
      totalWorkoutsCompleted = existing.profile.totalWorkoutsCompleted + 1;
    };
    let newMemberData : MemberData = {
      loggedSets = existing.loggedSets;
      completedExercises = existing.completedExercises;
      workoutCompletions = newCompletions;
      healthMetrics = existing.healthMetrics;
      profile = newProfile;
    };
    memberData.add(caller, newMemberData);
  };

  // Get Workout History for Caller
  public query ({ caller }) func getWorkoutHistory() : async [DailyWorkoutCompletion] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view workout history");
    };
    switch (memberData.get(caller)) {
      case (null) { [] };
      case (?data) {
        data.workoutCompletions.values().toArray().sort();
      };
    };
  };

  // Get Personal Fitness Profile
  public query ({ caller }) func getPersonalProfile() : async ?FitnessProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view fitness profile");
    };
    memberData.get(caller).map(func(data : MemberData) : FitnessProfile { data.profile });
  };

  // Admin function to view any user's data (for support/moderation)
  public query ({ caller }) func adminGetUserData(user : Principal) : async ?MemberData {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view other users' data");
    };
    memberData.get(user);
  };

  // Invite links and RSVP system functions

  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  public shared func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteState);
  };
};
