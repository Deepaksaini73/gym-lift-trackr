export type WorkoutSet = {
  reps: number;
  weight: number;
};

export type WorkoutLog = {
  id: string;
  user_id: string;
  body_part: string;
  exercise_name: string;
  sets: WorkoutSet[];
  max_weight: number;
  date: string;
  time: string;
  created_at: string;
};

export type CustomExercise = {
  id: string;
  user_id: string;
  body_part: string;
  name: string;
  created_at: string;
};

export type DemoUser = {
  id: string;
  full_name: string;
  email: string;
  weight: number;
};

const WORKOUTS_KEY = "liftlog_mock_workouts";
const CUSTOM_EXERCISES_KEY = "liftlog_mock_custom_exercises";

export const demoUsers: DemoUser[] = [
  {
    id: "demo-user-1",
    full_name: "Alex Carter",
    email: "alex@liftlog.dev",
    weight: 77.4,
  },
  {
    id: "demo-user-2",
    full_name: "Mia Johnson",
    email: "mia@liftlog.dev",
    weight: 64.8,
  },
  {
    id: "demo-user-3",
    full_name: "Noah Smith",
    email: "noah@liftlog.dev",
    weight: 84.2,
  },
  {
    id: "demo-user-4",
    full_name: "Ava Wilson",
    email: "ava@liftlog.dev",
    weight: 59.6,
  },
];

const currentDemoUserId = "demo-user-1";

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const toDateString = (date: Date) => date.toISOString().split("T")[0];

const toTimeString = (hours: number, minutes: number) =>
  `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const seedWorkoutLogs = (): WorkoutLog[] => {
  const now = new Date();

  return [
    {
      id: "log-1",
      user_id: "demo-user-1",
      body_part: "chest",
      exercise_name: "Bench Press",
      sets: [
        { reps: 10, weight: 60 },
        { reps: 8, weight: 70 },
        { reps: 6, weight: 80 },
      ],
      max_weight: 80,
      date: toDateString(daysAgo(0)),
      time: toTimeString(8, 30),
      created_at: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 30).toISOString(),
    },
    {
      id: "log-2",
      user_id: "demo-user-1",
      body_part: "back",
      exercise_name: "Barbell Row",
      sets: [
        { reps: 10, weight: 50 },
        { reps: 8, weight: 55 },
      ],
      max_weight: 55,
      date: toDateString(daysAgo(0)),
      time: toTimeString(9, 10),
      created_at: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 10).toISOString(),
    },
    {
      id: "log-3",
      user_id: "demo-user-1",
      body_part: "legs",
      exercise_name: "Squat",
      sets: [
        { reps: 8, weight: 80 },
        { reps: 6, weight: 90 },
        { reps: 5, weight: 95 },
      ],
      max_weight: 95,
      date: toDateString(daysAgo(1)),
      time: toTimeString(18, 20),
      created_at: daysAgo(1).toISOString(),
    },
    {
      id: "log-4",
      user_id: "demo-user-1",
      body_part: "shoulders",
      exercise_name: "Shoulder Press",
      sets: [
        { reps: 10, weight: 30 },
        { reps: 8, weight: 35 },
      ],
      max_weight: 35,
      date: toDateString(daysAgo(2)),
      time: toTimeString(17, 0),
      created_at: daysAgo(2).toISOString(),
    },
    {
      id: "log-5",
      user_id: "demo-user-1",
      body_part: "arms",
      exercise_name: "Dumbbell Curl",
      sets: [
        { reps: 12, weight: 12 },
        { reps: 10, weight: 14 },
        { reps: 8, weight: 16 },
      ],
      max_weight: 16,
      date: toDateString(daysAgo(4)),
      time: toTimeString(7, 45),
      created_at: daysAgo(4).toISOString(),
    },
    {
      id: "log-6",
      user_id: "demo-user-2",
      body_part: "chest",
      exercise_name: "Bench Press",
      sets: [
        { reps: 8, weight: 90 },
        { reps: 6, weight: 100 },
        { reps: 5, weight: 110 },
      ],
      max_weight: 110,
      date: toDateString(daysAgo(0)),
      time: toTimeString(10, 0),
      created_at: daysAgo(0).toISOString(),
    },
    {
      id: "log-7",
      user_id: "demo-user-3",
      body_part: "legs",
      exercise_name: "Squat",
      sets: [
        { reps: 8, weight: 110 },
        { reps: 6, weight: 130 },
        { reps: 5, weight: 140 },
      ],
      max_weight: 140,
      date: toDateString(daysAgo(3)),
      time: toTimeString(19, 15),
      created_at: daysAgo(3).toISOString(),
    },
    {
      id: "log-8",
      user_id: "demo-user-4",
      body_part: "back",
      exercise_name: "Deadlift",
      sets: [
        { reps: 5, weight: 100 },
        { reps: 5, weight: 120 },
        { reps: 3, weight: 130 },
      ],
      max_weight: 130,
      date: toDateString(daysAgo(2)),
      time: toTimeString(6, 50),
      created_at: daysAgo(2).toISOString(),
    },
    {
      id: "log-9",
      user_id: "demo-user-1",
      body_part: "back",
      exercise_name: "Deadlift",
      sets: [
        { reps: 5, weight: 110 },
        { reps: 5, weight: 130 },
        { reps: 3, weight: 150 },
      ],
      max_weight: 150,
      date: toDateString(daysAgo(5)),
      time: toTimeString(20, 10),
      created_at: daysAgo(5).toISOString(),
    },
  ];
};

const seedCustomExercises = (): CustomExercise[] => [];

const readJSON = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
};

const writeJSON = <T,>(key: string, value: T) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const getCurrentDemoUser = () => demoUsers.find((user) => user.id === currentDemoUserId) ?? demoUsers[0];

export const getWorkoutLogs = (): WorkoutLog[] => readJSON<WorkoutLog[]>(WORKOUTS_KEY, seedWorkoutLogs());

export const saveWorkoutLogs = (logs: WorkoutLog[]) => {
  writeJSON(WORKOUTS_KEY, logs);
};

export const addWorkoutLog = (log: Omit<WorkoutLog, "id" | "created_at"> & { id?: string; created_at?: string }) => {
  const logs = getWorkoutLogs();
  const newLog: WorkoutLog = {
    ...log,
    id: log.id ?? createId(),
    created_at: log.created_at ?? new Date().toISOString(),
  };
  logs.unshift(newLog);
  saveWorkoutLogs(logs);
  return newLog;
};

export const updateWorkoutLog = (id: string, next: Partial<WorkoutLog>) => {
  const logs = getWorkoutLogs().map((log) => (log.id === id ? { ...log, ...next } : log));
  saveWorkoutLogs(logs);
  return logs;
};

export const deleteWorkoutLog = (id: string) => {
  const logs = getWorkoutLogs().filter((log) => log.id !== id);
  saveWorkoutLogs(logs);
  return logs;
};

export const getCustomExercises = () => readJSON<CustomExercise[]>(CUSTOM_EXERCISES_KEY, seedCustomExercises());

export const addCustomExercise = (exercise: Omit<CustomExercise, "id" | "created_at">) => {
  const exercises = getCustomExercises();
  const newExercise: CustomExercise = {
    ...exercise,
    id: createId(),
    created_at: new Date().toISOString(),
  };
  exercises.unshift(newExercise);
  writeJSON(CUSTOM_EXERCISES_KEY, exercises);
  return newExercise;
};

export const getWeightHistory = (userId: string) => {
  const logs = getWorkoutLogs().filter((log) => log.user_id === userId);

  const history = [
    { date: toDateString(daysAgo(14)), weight: 78.4 },
    { date: toDateString(daysAgo(7)), weight: 77.9 },
    { date: toDateString(daysAgo(0)), weight: 77.4 },
  ];

  if (logs.length === 0) {
    return history;
  }

  return history;
};