import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, Trash2, Edit, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface WorkoutSet {
  reps: number;
  weight: number;
}

interface WorkoutLog {
  id: string;
  body_part: string;
  exercise_name: string;
  sets: WorkoutSet[];
  max_weight: number;
  time: string;
  created_at: string;
}

interface GroupedWorkouts {
  [bodyPart: string]: WorkoutLog[];
}

const Workout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutLog | null>(null);
  const [editSets, setEditSets] = useState<WorkoutSet[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTodayWorkouts();
    }
  }, [user]);

  const fetchTodayWorkouts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setWorkouts(data || []);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      toast({
        title: "Error",
        description: "Failed to load today's workouts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("workout_logs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Workout log deleted successfully",
      });

      fetchTodayWorkouts();
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast({
        title: "Error",
        description: "Failed to delete workout",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (workout: WorkoutLog) => {
    setEditingWorkout(workout);
    setEditSets([...workout.sets]);
  };

  const updateEditSet = (index: number, field: "reps" | "weight", value: number) => {
    const newSets = [...editSets];
    newSets[index][field] = value;
    setEditSets(newSets);
  };

  const handleUpdate = async () => {
    if (!editingWorkout) return;

    const validSets = editSets.filter(set => set.reps > 0 || set.weight > 0);
    if (validSets.length === 0) {
      toast({
        title: "Invalid Data",
        description: "Please enter at least one set",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      const maxWeight = Math.max(...validSets.map(set => set.weight));

      const { error } = await supabase
        .from("workout_logs")
        .update({
          sets: validSets,
          max_weight: maxWeight,
        })
        .eq("id", editingWorkout.id);

      if (error) throw error;

      toast({
        title: "Updated",
        description: "Workout updated successfully",
      });

      setEditingWorkout(null);
      fetchTodayWorkouts();
    } catch (error) {
      console.error("Error updating workout:", error);
      toast({
        title: "Error",
        description: "Failed to update workout",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Group workouts by body part
  const groupedWorkouts: GroupedWorkouts = workouts.reduce((acc, workout) => {
    if (!acc[workout.body_part]) {
      acc[workout.body_part] = [];
    }
    acc[workout.body_part].push(workout);
    return acc;
  }, {} as GroupedWorkouts);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="pt-2">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Today's Workout</h1>
          </div>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {workouts.length === 0 ? (
          <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-dashed border-2">
            <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Workouts Yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Start logging your exercises to see them here!
            </p>
            <Button
              onClick={() => window.location.href = "/"}
              className="bg-primary hover:bg-primary/90"
            >
              Start Workout
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-4 text-center bg-gradient-to-br from-primary/10 to-primary/5">
                <p className="text-2xl font-bold text-foreground">{workouts.length}</p>
                <p className="text-xs text-muted-foreground">Exercises</p>
              </Card>
              <Card className="p-4 text-center bg-gradient-to-br from-secondary/10 to-secondary/5">
                <p className="text-2xl font-bold text-foreground">
                  {workouts.reduce((acc, w) => acc + w.sets.length, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Sets</p>
              </Card>
              <Card className="p-4 text-center bg-gradient-to-br from-primary/10 to-primary/5">
                <p className="text-2xl font-bold text-foreground">
                  {Object.keys(groupedWorkouts).length}
                </p>
                <p className="text-xs text-muted-foreground">Body Parts</p>
              </Card>
            </div>

            {/* Grouped Workouts by Body Part */}
            {Object.entries(groupedWorkouts).map(([bodyPart, bodyPartWorkouts]) => (
              <div key={bodyPart} className="space-y-3">
                <h2 className="text-xl font-bold text-foreground capitalize flex items-center gap-2">
                  <span className="text-2xl">
                    {bodyPart === 'chest' ? '💪' : 
                     bodyPart === 'back' ? '🦾' :
                     bodyPart === 'shoulders' ? '🏋️' :
                     bodyPart === 'arms' ? '💪' :
                     bodyPart === 'legs' ? '🦵' :
                     bodyPart === 'abs' ? '🎯' : '🔥'}
                  </span>
                  {bodyPart}
                </h2>

                {bodyPartWorkouts.map((workout) => (
                  <Card key={workout.id} className="p-4 bg-card border-border hover:border-primary/50 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {workout.exercise_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(`2000-01-01T${workout.time}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(workout)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(workout.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* Sets Display */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground px-2">
                        <span>Set</span>
                        <span>Reps</span>
                        <span>Weight (kg)</span>
                      </div>
                      {workout.sets.map((set, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-3 gap-2 text-sm bg-muted/30 rounded p-2"
                        >
                          <span className="font-medium text-foreground">{idx + 1}</span>
                          <span className="text-foreground">{set.reps}</span>
                          <span className="text-foreground">{set.weight}</span>
                        </div>
                      ))}
                    </div>

                    {/* PR Badge */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Max Weight (PR)</span>
                        <span className="text-sm font-bold text-primary">
                          {workout.max_weight} kg
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingWorkout} onOpenChange={() => setEditingWorkout(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Workout</DialogTitle>
            <DialogDescription>
              {editingWorkout?.exercise_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-[60px_1fr_1fr] gap-2 text-sm font-medium text-muted-foreground">
              <span>Set</span>
              <span>Reps</span>
              <span>Weight (kg)</span>
            </div>
            {editSets.map((set, index) => (
              <div key={index} className="grid grid-cols-[60px_1fr_1fr] gap-2">
                <span className="text-sm font-medium text-foreground flex items-center">
                  {index + 1}
                </span>
                <Input
                  type="number"
                  value={set.reps || ""}
                  onChange={(e) => updateEditSet(index, "reps", parseInt(e.target.value) || 0)}
                  className="text-center"
                />
                <Input
                  type="number"
                  value={set.weight || ""}
                  onChange={(e) => updateEditSet(index, "weight", parseFloat(e.target.value) || 0)}
                  className="text-center"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingWorkout(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Workout;
