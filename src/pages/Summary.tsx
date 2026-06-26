import { useEffect, useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Flame,
  Award,
  Target,
  Crown,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  demoUsers,
  getCurrentDemoUser,
  getWeightHistory,
  getWorkoutLogs,
} from "@/data/mockGymData";

interface WorkoutStats {
  totalWorkouts: number;
  totalVolume: number;
  bodyPartsTrained: string[];
  topExercises: Array<{ name: string; count: number; maxWeight: number }>;
  weeklyVolume: Array<{ day: string; volume: number; date: string }>;
  muscleDistribution: Array<{ name: string; value: number }>;
}

interface PersonalRecord {
  exercise_name: string;
  max_weight: number;
  date: string;
  body_part: string;
}

interface LeaderboardEntry {
  exercise_name: string;
  max_weight: number;
  user_name: string;
  user_id: string;
  date: string;
  rank: number;
  isCurrentUser?: boolean;
}

interface WeightProgress {
  date: string;
  weight: number;
}

interface ExerciseProgressData {
  session: string;
  maxWeight: number;
  date: string;
  fullDate: string;
}

const Summary = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [weightProgress, setWeightProgress] = useState<WeightProgress[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>("Bench Press");
  const [exerciseProgressData, setExerciseProgressData] = useState<ExerciseProgressData[]>([]);
  const [selectedExerciseForProgress, setSelectedExerciseForProgress] = useState<string>("");
  const [availableExercises, setAvailableExercises] = useState<string[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<{ full_name: string | null } | null>(null);

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const popularExercises = [
    "Bench Press",
    "Deadlift",
    "Squat",
    "Shoulder Press",
    "Barbell Row",
    "Pull Up",
  ];

  useEffect(() => {
    loadAllData();
  }, [user]);

  useEffect(() => {
    if (selectedExerciseForProgress) {
      fetchExerciseProgress(selectedExerciseForProgress);
    }
  }, [selectedExerciseForProgress]);

  useEffect(() => {
    fetchLeaderboard(selectedExercise);
  }, [selectedExercise]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      fetchCurrentUserProfile();
      fetchWorkoutStats();
      fetchPersonalRecords();
      fetchLeaderboard(selectedExercise);
      fetchWeightProgress();
      fetchAvailableExercises();
    } catch (error) {
      console.error("Error loading summary data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUserProfile = () => {
    const currentUser = user ?? getCurrentDemoUser();
    const demoUser = demoUsers.find((demo) => demo.id === currentUser.id) ?? null;

    setCurrentUserProfile({
      full_name: demoUser?.full_name ?? currentUser.full_name ?? null,
    });
  };

  const fetchAvailableExercises = () => {
    const currentUserId = user?.id ?? getCurrentDemoUser().id;
    const logs = getWorkoutLogs().filter((log) => log.user_id === currentUserId);

    const uniqueExercises = Array.from(new Set(logs.map((log) => log.exercise_name))).sort();
    setAvailableExercises(uniqueExercises);

    if (uniqueExercises.length > 0 && !selectedExerciseForProgress) {
      setSelectedExerciseForProgress(uniqueExercises[0]);
    }
  };

  const fetchExerciseProgress = async (exerciseName: string) => {
    if (!exerciseName) return;

    const currentUserId = user?.id ?? getCurrentDemoUser().id;

    const logs = getWorkoutLogs()
      .filter((log) => log.user_id === currentUserId && log.exercise_name === exerciseName)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const progressData: ExerciseProgressData[] = logs.map((log, index) => ({
      session: `#${index + 1}`,
      maxWeight: log.max_weight,
      date: new Date(log.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      fullDate: new Date(log.created_at).toLocaleDateString(),
    }));

    setExerciseProgressData(progressData);
  };

  const fetchWorkoutStats = () => {
    const currentUserId = user?.id ?? getCurrentDemoUser().id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logs = getWorkoutLogs().filter(
      (log) => log.user_id === currentUserId && new Date(log.created_at) >= sevenDaysAgo
    );

    const totalWorkouts = logs.length;

    const totalVolume =
      logs.reduce((sum, log) => {
        const setVolume = log.sets.reduce(
          (setSum, set) => setSum + set.reps * set.weight,
          0
        );
        return sum + setVolume;
      }, 0) || 0;

    const bodyPartsTrained = Array.from(new Set(logs.map((log) => log.body_part)));

    const exerciseMap = new Map<string, { count: number; maxWeight: number }>();
    logs.forEach((log) => {
      const existing = exerciseMap.get(log.exercise_name) || { count: 0, maxWeight: 0 };
      exerciseMap.set(log.exercise_name, {
        count: existing.count + 1,
        maxWeight: Math.max(existing.maxWeight, log.max_weight),
      });
    });

    const topExercises = Array.from(exerciseMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const weeklyVolumeMap = new Map<string, number>();
    logs.forEach((log) => {
      const dateKey = new Date(log.created_at).toISOString().split("T")[0];
      const setVolume = log.sets.reduce(
        (sum, set) => sum + set.reps * set.weight,
        0
      );
      weeklyVolumeMap.set(dateKey, (weeklyVolumeMap.get(dateKey) || 0) + setVolume);
    });

    const weeklyVolume = Array.from(weeklyVolumeMap.entries())
      .map(([date, volume]) => ({
        day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        volume,
        date,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const bodyPartVolume = new Map<string, number>();
    logs.forEach((log) => {
      const setVolume = log.sets.reduce(
        (sum, set) => sum + set.reps * set.weight,
        0
      );
      bodyPartVolume.set(
        log.body_part,
        (bodyPartVolume.get(log.body_part) || 0) + setVolume
      );
    });

    const muscleDistribution = Array.from(bodyPartVolume.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    setStats({
      totalWorkouts,
      totalVolume,
      bodyPartsTrained,
      topExercises,
      weeklyVolume,
      muscleDistribution,
    });
  };

  const fetchPersonalRecords = () => {
    const currentUserId = user?.id ?? getCurrentDemoUser().id;
    const logs = getWorkoutLogs().filter((log) => log.user_id === currentUserId);

    const recordsMap = new Map<string, PersonalRecord>();
    logs.forEach((log) => {
      const existing = recordsMap.get(log.exercise_name);
      if (!existing || log.max_weight > existing.max_weight) {
        recordsMap.set(log.exercise_name, {
          exercise_name: log.exercise_name,
          max_weight: log.max_weight,
          date: new Date(log.created_at).toLocaleDateString(),
          body_part: log.body_part,
        });
      }
    });

    const records = Array.from(recordsMap.values())
      .sort((a, b) => b.max_weight - a.max_weight)
      .slice(0, 10);

    setPersonalRecords(records);
  };

  const fetchLeaderboard = (exerciseName: string) => {
    const logs = getWorkoutLogs().filter((log) => log.exercise_name === exerciseName);

    if (logs.length === 0) {
      setLeaderboard([]);
      return;
    }

    const userBestMap = new Map<string, { max_weight: number; created_at: string }>();

    logs.forEach((log) => {
      const existing = userBestMap.get(log.user_id);
      if (!existing || log.max_weight > existing.max_weight) {
        userBestMap.set(log.user_id, {
          max_weight: log.max_weight,
          created_at: log.created_at,
        });
      }
    });

    const usersWithNames = Array.from(userBestMap.entries()).map(([userId, data]) => {
      const profile = demoUsers.find((u) => u.id === userId);

      const userName =
        userId === (user?.id ?? getCurrentDemoUser().id)
          ? currentUserProfile?.full_name || profile?.full_name || "You"
          : profile?.full_name || `User ${userId.substring(0, 8)}`;

      return {
        user_id: userId,
        user_name: userName,
        max_weight: data.max_weight,
        created_at: data.created_at,
        isCurrentUser: userId === (user?.id ?? getCurrentDemoUser().id),
      };
    });

    const sortedUsers = usersWithNames.sort((a, b) => b.max_weight - a.max_weight);

    const leaderboardData: LeaderboardEntry[] = sortedUsers.map((entry, index) => ({
      exercise_name: exerciseName,
      max_weight: entry.max_weight,
      user_name: entry.user_name,
      user_id: entry.user_id,
      date: new Date(entry.created_at).toLocaleDateString(),
      rank: index + 1,
      isCurrentUser: entry.isCurrentUser,
    }));

    setLeaderboard(leaderboardData.slice(0, 10));
  };

  const fetchWeightProgress = () => {
    const currentUserId = user?.id ?? getCurrentDemoUser().id;
    setWeightProgress(getWeightHistory(currentUserId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your summary...</p>
        </div>
      </div>
    );
  }

  const currentUserRank = leaderboard.find((entry) => entry.isCurrentUser);
  const weightTrend =
    weightProgress.length >= 2
      ? weightProgress[weightProgress.length - 1].weight - weightProgress[0].weight
      : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="pt-2">
          <h1 className="text-3xl font-bold text-foreground">Summary</h1>
          <p className="text-muted-foreground">Your complete fitness overview</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Workouts</p>
                </div>
                <p className="text-3xl font-bold text-primary">
                  {stats?.totalWorkouts || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-secondary" />
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                </div>
                <p className="text-3xl font-bold text-secondary">
                  {stats ? (stats.totalVolume / 1000).toFixed(1) : 0}k
                </p>
                <p className="text-xs text-muted-foreground mt-1">kg lifted</p>
              </Card>
            </div>

            {availableExercises.length > 0 && (
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Exercise Progress</h3>
                  </div>
                  <Select value={selectedExerciseForProgress} onValueChange={setSelectedExerciseForProgress}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableExercises.map((exercise) => (
                        <SelectItem key={exercise} value={exercise}>
                          {exercise}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {exerciseProgressData.length > 0 ? (
                  <>
                    <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Current PR</p>
                          <p className="text-2xl font-bold text-primary">
                            {Math.max(...exerciseProgressData.map((d) => d.maxWeight))} kg
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Sessions</p>
                          <p className="text-2xl font-bold text-foreground">
                            {exerciseProgressData.length}
                          </p>
                        </div>
                      </div>
                    </div>

                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={exerciseProgressData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="session"
                          stroke="#9CA3AF"
                          style={{ fontSize: "12px" }}
                        />
                        <YAxis
                          stroke="#9CA3AF"
                          style={{ fontSize: "12px" }}
                          domain={["dataMin - 5", "dataMax + 5"]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                          }}
                          formatter={(value: any) => [`${value} kg`, "Max Weight"]}
                          labelFormatter={(label) => {
                            const entry = exerciseProgressData.find((d) => d.session === label);
                            return entry ? `${entry.session} - ${entry.fullDate}` : label;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="maxWeight"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--primary))", r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No progress data yet</p>
                  </div>
                )}
              </Card>
            )}

            {weightProgress.length > 0 && (
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">Body Weight</h3>
                  {weightTrend !== 0 && (
                    <div
                      className={`flex items-center gap-1 ${
                        weightTrend > 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {weightTrend > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="text-sm font-semibold">
                        {Math.abs(weightTrend).toFixed(1)} kg
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">
                    {weightProgress[weightProgress.length - 1].weight} kg
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Current weight</p>
                </div>
              </Card>
            )}

            {stats && stats.bodyPartsTrained.length > 0 && (
              <Card className="p-4 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Body Parts Trained
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stats.bodyPartsTrained.map((part) => (
                    <span
                      key={part}
                      className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium capitalize"
                    >
                      {part}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {stats && stats.topExercises.length > 0 && (
              <Card className="p-4 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Top 3 Exercises
                </h3>
                <div className="space-y-3">
                  {stats.topExercises.map((exercise, index) => (
                    <div
                      key={exercise.name}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                        </span>
                        <div>
                          <p className="text-foreground font-medium">{exercise.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {exercise.count} sessions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{exercise.maxWeight} kg</p>
                        <p className="text-xs text-muted-foreground">PR</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {stats && stats.weeklyVolume.length > 0 && (
              <Card className="p-4 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Volume</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.weeklyVolume}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9CA3AF" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#9CA3AF" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any) => [`${value} kg`, "Volume"]}
                    />
                    <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {stats && stats.muscleDistribution.length > 0 && (
              <Card className="p-4 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Muscle Group Distribution
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.muscleDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.muscleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}

            {stats?.totalWorkouts === 0 && (
              <Card className="p-8 text-center border-dashed border-2">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Data Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start logging workouts to see your progress!
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="records" className="space-y-4 mt-6">
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Your Personal Records
                </h3>
              </div>

              {personalRecords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No records yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start working out to set your PRs!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {personalRecords.map((record, index) => (
                    <div
                      key={record.exercise_name}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-primary w-6">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="text-foreground font-medium">{record.exercise_name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {record.body_part} • {record.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {record.max_weight} kg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4 mt-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {popularExercises.map((exercise) => (
                <Button
                  key={exercise}
                  variant={selectedExercise === exercise ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedExercise(exercise)}
                  className="whitespace-nowrap"
                >
                  {exercise}
                </Button>
              ))}
            </div>

            {currentUserRank && (
              <Card className="p-4 bg-gradient-to-br from-primary/20 to-secondary/10 border-primary/30">
                <div className="flex items-center gap-3">
                  {currentUserRank.rank === 1 ? (
                    <Crown className="h-8 w-8 text-yellow-500 animate-pulse" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">
                        #{currentUserRank.rank}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Your Rank</p>
                    <p className="text-lg font-bold text-foreground">
                      {currentUserRank.rank === 1
                        ? "🎉 You're #1!"
                        : `${currentUserRank.user_name}`}
                    </p>
                    <p className="text-sm text-primary font-semibold">
                      {currentUserRank.max_weight} kg PR
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedExercise} Leaderboard
                </h3>
              </div>

              {leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No data for this exercise</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Be the first to log it!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                        entry.isCurrentUser
                          ? "bg-primary/20 border-2 border-primary"
                          : "bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            entry.rank === 1
                              ? "bg-yellow-500 text-background"
                              : entry.rank === 2
                              ? "bg-gray-400 text-background"
                              : entry.rank === 3
                              ? "bg-amber-600 text-background"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {entry.rank === 1 ? "👑" : `#${entry.rank}`}
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              entry.isCurrentUser ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {entry.user_name}
                            {entry.isCurrentUser && " (You)"}
                          </p>
                          <p className="text-xs text-muted-foreground">{entry.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {entry.max_weight} kg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Summary;
