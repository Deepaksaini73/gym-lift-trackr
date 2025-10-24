// Dummy data for the app - TODO: Replace with real database

// Chest exercises
import benchPress from "@/assets/exercises/bench_press.png";
import inclineDumbbellPress from "@/assets/exercises/incline_dubell_press.png";
import cableFly from "@/assets/exercises/cable_fly.png";
import pushUps from "@/assets/exercises/push_ups.png";
import declineBenchPress from "@/assets/exercises/decline_bench_press.png";
import chestDips from "@/assets/exercises/chest_dips.png";
import pecDeckMachine from "@/assets/exercises/pec_deck_machine.png";
import dumbbellPullover from "@/assets/exercises/dumbbell_pullover.png";

// Back exercises
import deadlift from "@/assets/exercises/deadlift.png";
import pullUps from "@/assets/exercises/pull_ups.png";
import barbellRow from "@/assets/exercises/barbell_row.png";
import latPulldown from "@/assets/exercises/lat_pulldown.png";
import seatedCableRow from "@/assets/exercises/seated_cable_row.png";
import tBarRow from "@/assets/exercises/T_bar_row.png";
import hyperextension from "@/assets/exercises/hyperextension.png";
import singleArmDumbbellRow from "@/assets/exercises/single_arm_dumbbell_row.png";

// Shoulder exercises
import shoulderPress from "@/assets/exercises/shoulder-press.jpg";
import lateralRaise from "@/assets/exercises/lateral_raise.png";
import frontRaise from "@/assets/exercises/front_raises.png";
import facePulls from "@/assets/exercises/face_pulls.png";
import arnoldPress from "@/assets/exercises/arnolad_press.png";
import uprightRow from "@/assets/exercises/upright_row.png";
import rearDeltFly from "@/assets/exercises/rear_delt_fly.png";
import dumbbellShrugs from "@/assets/exercises/dumbbell_shurugs.png";

// Arms exercises
import barbellCurl from "@/assets/exercises/barbell_curls.png";
import tricepDips from "@/assets/exercises/tricep_dips.png";
import hammerCurl from "@/assets/exercises/hammer_curl.png";
import skullCrushers from "@/assets/exercises/skull_crushers.png";
import overheadTricepExtension from "@/assets/exercises/Overhead_Tricep_Extension.png";
import preacherCurl from "@/assets/exercises/preacher_curl.png";
import cableRopePushdown from "@/assets/exercises/Cable_Rope_Pushdown.png";
import concentrationCurl from "@/assets/exercises/concentration_curl.png";

// Legs exercises
import squat from "@/assets/exercises/squat.png";
import legPress from "@/assets/exercises/leg_press.png";
import legCurl from "@/assets/exercises/leg_curl.png";
import calfRaise from "@/assets/exercises/calf_raise.png";
import lunges from "@/assets/exercises/lunges.png";
import stepUps from "@/assets/exercises/step_ups.png";
import legExtension from "@/assets/exercises/leg_extenstion.png";
import bulgarianSplitSquat from "@/assets/exercises/Bulgarian_Split_Squat.png";

// Abs exercises
import crunches from "@/assets/exercises/Crunches.png";
import plank from "@/assets/exercises/plank.png";
import russianTwist from "@/assets/exercises/russian_twist.png";
import legRaise from "@/assets/exercises/leg_raise.png";
import bicycleCrunch from "@/assets/exercises/bycycle_crunch.png";
import mountainClimber from "@/assets/exercises/mountain_climber.png";
import sidePlank from "@/assets/exercises/side_plank.png";
import hangingKneeRaise from "@/assets/exercises/Hanging_Knee_Raise.png";

// Cardio exercises
import treadmillRun from "@/assets/exercises/Treadmill_Run.png";
import cycling from "@/assets/exercises/cycling.png";
import jumpRope from "@/assets/exercises/junp_rope.png";
import rowingMachine from "@/assets/exercises/rowing_machine.png";

// Forearms exercises
import wristCurl from "@/assets/exercises/wrist_curl.png";
import reverseCurl from "@/assets/exercises/reverse_curl.png";
import farmersWalk from "@/assets/exercises/farmer's walk.png";
import platePinch from "@/assets/exercises/plate_pinch.png";

// Glutes exercises
import hipThrust from "@/assets/exercises/hip_thrust.png";
import gluteBridge from "@/assets/exercises/glute_bridge.png";
import cableKickback from "@/assets/exercises/cable_kickback.png";
import sumoDeadlift from "@/assets/exercises/sumo_deadlift.png";

export const bodyParts = [
  { id: "chest", name: "Chest", icon: "💪" },
  { id: "back", name: "Back", icon: "🦾" },
  { id: "shoulders", name: "Shoulders", icon: "🏋️" },
  { id: "arms", name: "Arms", icon: "💪" },
  { id: "legs", name: "Legs", icon: "🦵" },
  { id: "abs", name: "Abs", icon: "🎯" },
  { id: "cardio", name: "Cardio", icon: "🔥" },
  { id: "forearms", name: "Forearms", icon: "✊" },
  { id: "glutes", name: "Glutes", icon: "🍑" },
];

// 💪 Chest
export const exercises = {
  chest: [
    { id: "BenchPress", name: "Bench Press", bodyPart: "chest", image: benchPress },
    { id: "InclineDumbbellPress", name: "Incline Dumbbell Press", bodyPart: "chest", image: inclineDumbbellPress },
    { id: "CableFly", name: "Cable Fly", bodyPart: "chest", image: cableFly },
    { id: "PushUps", name: "Push Ups", bodyPart: "chest", image: pushUps },
    { id: "DeclineBenchPress", name: "Decline Bench Press", bodyPart: "chest", image: declineBenchPress },
    { id: "ChestDips", name: "Chest Dips", bodyPart: "chest", image: chestDips },
    { id: "PecDeckMachine", name: "Pec Deck Machine", bodyPart: "chest", image: pecDeckMachine },
    { id: "DumbbellPullover", name: "Dumbbell Pullover", bodyPart: "chest", image: dumbbellPullover },
  ],

  back: [
    { id: "Deadlift", name: "Deadlift", bodyPart: "back", image: deadlift },
    { id: "PullUps", name: "Pull Ups", bodyPart: "back", image: pullUps },
    { id: "BarbellRow", name: "Barbell Row", bodyPart: "back", image: barbellRow },
    { id: "LatPulldown", name: "Lat Pulldown", bodyPart: "back", image: latPulldown },
    { id: "SeatedCableRow", name: "Seated Cable Row", bodyPart: "back", image: seatedCableRow },
    { id: "TBarRow", name: "T-Bar Row", bodyPart: "back", image: tBarRow },
    { id: "Hyperextension", name: "Hyperextension", bodyPart: "back", image: hyperextension },
    { id: "SingleArmDumbbellRow", name: "Single Arm Dumbbell Row", bodyPart: "back", image: singleArmDumbbellRow },
  ],

  shoulders: [
    { id: "ShoulderPress", name: "Shoulder Press", bodyPart: "shoulders", image: shoulderPress },
    { id: "LateralRaise", name: "Lateral Raise", bodyPart: "shoulders", image: lateralRaise },
    { id: "FrontRaise", name: "Front Raise", bodyPart: "shoulders", image: frontRaise },
    { id: "FacePulls", name: "Face Pulls", bodyPart: "shoulders", image: facePulls },
    { id: "ArnoldPress", name: "Arnold Press", bodyPart: "shoulders", image: arnoldPress },
    { id: "UprightRow", name: "Upright Row", bodyPart: "shoulders", image: uprightRow },
    { id: "RearDeltFly", name: "Rear Delt Fly", bodyPart: "shoulders", image: rearDeltFly },
    { id: "DumbbellShrugs", name: "Dumbbell Shrugs", bodyPart: "shoulders", image: dumbbellShrugs },
  ],

  arms: [
    { id: "BarbellCurl", name: "Barbell Curl", bodyPart: "arms", image: barbellCurl },
    { id: "TricepDips", name: "Tricep Dips", bodyPart: "arms", image: tricepDips },
    { id: "HammerCurl", name: "Hammer Curl", bodyPart: "arms", image: hammerCurl },
    { id: "SkullCrushers", name: "Skull Crushers", bodyPart: "arms", image: skullCrushers },
    { id: "OverheadTricepExtension", name: "Overhead Tricep Extension", bodyPart: "arms", image: overheadTricepExtension },
    { id: "PreacherCurl", name: "Preacher Curl", bodyPart: "arms", image: preacherCurl },
    { id: "CableRopePushdown", name: "Cable Rope Pushdown", bodyPart: "arms", image: cableRopePushdown },
    { id: "ConcentrationCurl", name: "Concentration Curl", bodyPart: "arms", image: concentrationCurl },
  ],

  legs: [
    { id: "Squat", name: "Squat", bodyPart: "legs", image: squat },
    { id: "LegPress", name: "Leg Press", bodyPart: "legs", image: legPress },
    { id: "LegCurl", name: "Leg Curl", bodyPart: "legs", image: legCurl },
    { id: "CalfRaise", name: "Calf Raise", bodyPart: "legs", image: calfRaise },
    { id: "Lunges", name: "Lunges", bodyPart: "legs", image: lunges },
    { id: "StepUps", name: "Step Ups", bodyPart: "legs", image: stepUps },
    { id: "LegExtension", name: "Leg Extension", bodyPart: "legs", image: legExtension },
    { id: "BulgarianSplitSquat", name: "Bulgarian Split Squat", bodyPart: "legs", image: bulgarianSplitSquat },
  ],

  abs: [
    { id: "Crunches", name: "Crunches", bodyPart: "abs", image: crunches },
    { id: "Plank", name: "Plank", bodyPart: "abs", image: plank },
    { id: "RussianTwist", name: "Russian Twist", bodyPart: "abs", image: russianTwist },
    { id: "LegRaise", name: "Leg Raise", bodyPart: "abs", image: legRaise },
    { id: "BicycleCrunch", name: "Bicycle Crunch", bodyPart: "abs", image: bicycleCrunch },
    { id: "MountainClimber", name: "Mountain Climber", bodyPart: "abs", image: mountainClimber },
    { id: "SidePlank", name: "Side Plank", bodyPart: "abs", image: sidePlank },
    { id: "HangingKneeRaise", name: "Hanging Knee Raise", bodyPart: "abs", image: hangingKneeRaise },
  ],

  cardio: [
    { id: "TreadmillRun", name: "Treadmill Run", bodyPart: "cardio", image: treadmillRun },
    { id: "Cycling", name: "Cycling", bodyPart: "cardio", image: cycling },
    { id: "JumpRope", name: "Jump Rope", bodyPart: "cardio", image: jumpRope },
    { id: "RowingMachine", name: "Rowing Machine", bodyPart: "cardio", image: rowingMachine },
  ],

  forearms: [
    { id: "WristCurl", name: "Wrist Curl", bodyPart: "forearms", image: wristCurl },
    { id: "ReverseCurl", name: "Reverse Curl", bodyPart: "forearms", image: reverseCurl },
    { id: "FarmersWalk", name: "Farmer's Walk", bodyPart: "forearms", image: farmersWalk },
    { id: "PlatePinch", name: "Plate Pinch", bodyPart: "forearms", image: platePinch },
  ],

  glutes: [
    { id: "HipThrust", name: "Hip Thrust", bodyPart: "glutes", image: hipThrust },
    { id: "GluteBridge", name: "Glute Bridge", bodyPart: "glutes", image: gluteBridge },
    { id: "CableKickback", name: "Cable Kickback", bodyPart: "glutes", image: cableKickback },
    { id: "SumoDeadlift", name: "Sumo Deadlift", bodyPart: "glutes", image: sumoDeadlift },
  ],
};


// 📊 Example expanded exercise history
export const exerciseHistory = {
  "BenchPress": [
    { date: "2024-10-10", sets: [{ reps: 10, weight: 35 }, { reps: 8, weight: 40 }, { reps: 6, weight: 45 }] },
    { date: "2024-10-13", sets: [{ reps: 10, weight: 37 }, { reps: 10, weight: 42 }, { reps: 8, weight: 47 }] },
    { date: "2024-10-17", sets: [{ reps: 12, weight: 37 }, { reps: 10, weight: 42 }, { reps: 8, weight: 47 }] },
    { date: "2024-10-20", sets: [{ reps: 10, weight: 40 }, { reps: 9, weight: 45 }, { reps: 7, weight: 50 }] },
  ],
  "ShoulderPress": [
    { date: "2024-10-12", sets: [{ reps: 12, weight: 60 }, { reps: 10, weight: 70 }, { reps: 8, weight: 75 }] },
    { date: "2024-10-15", sets: [{ reps: 10, weight: 65 }, { reps: 8, weight: 80 }, { reps: 6, weight: 85 }] },
  ],
  "Deadlift": [
    { date: "2024-10-11", sets: [{ reps: 8, weight: 0 }, { reps: 8, weight: 0 }, { reps: 6, weight: 0 }] },
    { date: "2024-10-18", sets: [{ reps: 10, weight: 0 }, { reps: 9, weight: 0 }, { reps: 8, weight: 0 }] },
  ],
};

// 📅 Weekly stats (enhanced)
export const weeklyStats = {
  workouts: 6,
  totalVolume: 23480,
  bodyPartsTrained: ["Chest", "Back", "Shoulders", "Arms", "Legs", "Abs"],
  topExercises: ["Bench Press", "Deadlift", "Squat", "Shoulder Press", "Pull Ups"],
  weeklyVolume: [
    { day: "Mon", volume: 3800 },
    { day: "Tue", volume: 0 },
    { day: "Wed", volume: 4200 },
    { day: "Thu", volume: 3100 },
    { day: "Fri", volume: 4600 },
    { day: "Sat", volume: 3780 },
    { day: "Sun", volume: 0 },
  ],
  muscleDistribution: [
    { name: "Chest", value: 22 },
    { name: "Back", value: 20 },
    { name: "Shoulders", value: 18 },
    { name: "Arms", value: 15 },
    { name: "Legs", value: 15 },
    { name: "Abs", value: 10 },
  ],
};

// 👤 User Profile (same but expanded)
export const userProfile = {
  name: "Deepak S.",
  goal: "Muscle Gain",
  streak: 9,
  favoriteExercises: [
    "Bench Press",
    "Deadlift",
    "Squat",
    "Shoulder Press",
    "Pull Ups",
    "Barbell Curl",
    "Lateral Raise",
  ],
  totalWorkouts: 178,
  totalVolume: 562430,
};
