import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { exercises } from "@/data/dummyData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { addWorkoutLog, getWorkoutLogs, getCurrentDemoUser } from "@/data/mockGymData";

interface Set {
  reps: number;
  weight: number;
}

interface ExerciseHistory {
  date: string;
  dayOfWeek: string;
  sets: Set[];
  max_weight: number;
  created_at: string;
}

const ExerciseDetail = () => {
  const { bodyPart, id } = useParams<{ bodyPart: string; id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sets, setSets] = useState<Set[]>([{ reps: 0, weight: 0 }]);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<ExerciseHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingExercise, setLoadingExercise] = useState(true);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseImage, setExerciseImage] = useState("");

  const isCustomExercise = id?.startsWith("custom-");
  const customExerciseId = isCustomExercise ? id?.replace("custom-", "") : null;

  useEffect(() => {
    loadExerciseData();
  }, [id, bodyPart]);

  const loadExerciseData = () => {
    setLoadingExercise(true);
    setLoadingHistory(true);

    try {
      if (isCustomExercise && customExerciseId) {
        const raw = window.localStorage.getItem("liftlog_mock_custom_exercises") || "[]";
        const customExercises = JSON.parse(raw);
        const customExercise = customExercises.find((item: any) => item.id === customExerciseId);

        if (customExercise?.name) {
          setExerciseName(customExercise.name);
          setExerciseImage(
            "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop"
          );
          fetchExerciseHistory(customExercise.name);
          return;
        }
      }

      const exercise = exercises[bodyPart as keyof typeof exercises]?.find((ex) => ex.id === id);

      if (exercise) {
        setExerciseName(exercise.name);
        setExerciseImage(exercise.image);
        fetchExerciseHistory(exercise.name);
        return;
      }

      setExerciseName(id || "Exercise");
      setExerciseImage(
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop"
      );
      setHistory([]);
      setLoadingHistory(false);
    } catch (error) {
      console.error("Error loading exercise:", error);
      setExerciseName(id || "Exercise");
      setExerciseImage(
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop"
      );
      setHistory([]);
      setLoadingHistory(false);
    } finally {
      setLoadingExercise(false);
    }
  };

  const fetchExerciseHistory = (name: string) => {
    try {
      const userId = getCurrentDemoUser().id;
      const data = getWorkoutLogs()
        .filter((log) => log.user_id === userId && log.exercise_name === name)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      const transformedHistory: ExerciseHistory[] = data.map((log) => {
        const logDate = new Date(log.created_at);
        return {
          date: logDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          dayOfWeek: logDate.toLocaleDateString("en-US", {
            weekday: "long",
          }),
          sets: log.sets,
          max_weight: log.max_weight,
          created_at: log.created_at,
        };
      });

      setHistory(transformedHistory);
    } catch (error) {
      console.error("Error loading history:", error);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getDayColor = (dayOfWeek: string) => {
    const colors: { [key: string]: string } = {
      Monday: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      Tuesday: "bg-green-500/20 text-green-400 border-green-500/30",
      Wednesday: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      Thursday: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      Friday: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      Saturday: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      Sunday: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[dayOfWeek] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  if (loadingExercise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading exercise...</p>
        </div>
      </div>
    );
  }

  const addSet = () => {
    setSets([...sets, { reps: 0, weight: 0 }]);
  };

  const updateSet = (index: number, field: "reps" | "weight", value: number) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
  };

  const deleteSet = (index: number) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const saveWorkout = () => {
    const validSets = sets.filter((set) => set.reps > 0 || set.weight > 0);
    if (validSets.length === 0) {
      toast({
        title: "Invalid Data",
        description: "Please enter at least one set with reps or weight",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const user = getCurrentDemoUser();
      const maxWeight = Math.max(...validSets.map((set) => set.weight), 0);
      const now = new Date();

      addWorkoutLog({
        user_id: user.id,
        body_part: bodyPart || "",
        exercise_name: exerciseName,
        sets: validSets,
        max_weight: maxWeight,
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().split(" ")[0],
      });

      toast({
        title: "Workout Saved! 💪",
        description: `${exerciseName} logged successfully`,
      });

      fetchExerciseHistory(exerciseName);
      setSets([{ reps: 0, weight: 0 }]);
    } catch (error) {
      console.error("Error saving workout:", error);
      toast({
        title: "Error",
        description: "Failed to save workout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const chartData = history
    .slice()
    .reverse()
    .map((entry, index) => ({
      session: `#${index + 1}`,
      maxWeight: entry.max_weight,
      date: entry.date,
    }));

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4 pt-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              {exerciseName}
              {isCustomExercise && (
                <span className="ml-2 text-xs bg-secondary text-background px-2 py-1 rounded-full">
                  Custom
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground capitalize">{bodyPart}</p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <img
            src={exerciseImage}
            alt={exerciseName}
            className="w-full h-48 object-cover"
          />
        </Card>

        {history.length > 0 && (
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current PR (Max Weight)</p>
                <p className="text-3xl font-bold text-primary">
                  {Math.max(...history.map((h) => h.max_weight))} kg
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold text-foreground">{history.length}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Log Your Sets</h2>
            <Button onClick={addSet} size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Set
            </Button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[60px_1fr_1fr_40px] gap-2 text-sm font-medium text-muted-foreground px-2">
              <span>Set</span>
              <span>Reps</span>
              <span>Weight (kg)</span>
              <span></span>
            </div>

            {sets.map((set, index) => (
              <div
                key={index}
                className="grid grid-cols-[60px_1fr_1fr_40px] gap-2 items-center"
              >
                <span className="text-sm font-medium text-foreground px-2">
                  {index + 1}
                </span>
                <Input
                  type="number"
                  placeholder="0"
                  value={set.reps || ""}
                  onChange={(e) =>
                    updateSet(index, "reps", parseInt(e.target.value) || 0)
                  }
                  className="text-center"
                />
                <Input
                  type="number"
                  placeholder="0"
                  step="0.5"
                  value={set.weight || ""}
                  onChange={(e) =>
                    updateSet(index, "weight", parseFloat(e.target.value) || 0)
                  }
                  className="text-center"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteSet(index)}
                  disabled={sets.length === 1}
                  className="h-9 w-9"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            onClick={saveWorkout}
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Save className="mr-2 h-5 w-5" />
            {saving ? "Saving..." : "Save Workout"}
          </Button>
        </Card>

        {loadingHistory ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading history...</p>
          </Card>
        ) : chartData.length > 0 ? (
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Progress History
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="session" stroke="#9CA3AF" style={{ fontSize: "12px" }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => [`${value} kg`, "Max Weight"]}
                />
                <Line
                  type="monotone"
                  dataKey="maxWeight"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={{ fill: "#6366F1", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        ) : (
          <Card className="p-8 text-center border-dashed border-2">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No history yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete your first set to see progress!
            </p>
          </Card>
        )}

        {history.length > 0 && (
          <Card className="p-4 space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Previous Sessions ({history.length})
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.map((session, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        Session #{history.length - idx}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getDayColor(
                          session.dayOfWeek
                        )}`}
                      >
                        {session.dayOfWeek}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{session.date}</p>
                  </div>
                  <div className="space-y-1">
                    {session.sets.map((set, setIdx) => (
                      <div
                        key={setIdx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">Set {setIdx + 1}:</span>
                        <span className="text-foreground font-medium">
                          {set.reps} reps × {set.weight} kg
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Max Weight:</span>
                    <span className="text-sm font-bold text-primary">
                      {session.max_weight} kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExerciseDetail;
