import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, ArrowLeft, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { exercises, bodyParts } from "@/data/dummyData";
import { BottomNav } from "@/components/BottomNav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ExerciseList = () => {
  const { part } = useParams<{ part: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [customExercises, setCustomExercises] = useState<any[]>([]);

  const bodyPart = bodyParts.find((bp) => bp.id === part);
  const defaultExerciseList =
    exercises[part as keyof typeof exercises] || [];

  const allExercises = [
    ...defaultExerciseList,
    ...customExercises,
  ];

  const filteredExercises = allExercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomExercise = async () => {
    if (!customExerciseName.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter an exercise name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const newExercise = {
        id: Date.now().toString(),
        name: customExerciseName.trim(),
        bodyPart: part,
        image: "/placeholder.svg",
        isCustom: true,
      };

      setCustomExercises((prev) => [...prev, newExercise]);

      toast({
        title: "Success! 🎉",
        description: `"${customExerciseName}" added successfully`,
      });

      setCustomExerciseName("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding custom exercise:", error);

      toast({
        title: "Error",
        description: "Failed to add custom exercise",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExerciseClick = (exercise: any) => {
    if (exercise.isCustom) {
      navigate(`/exercise/${part}/custom-${exercise.id}`);
    } else {
      navigate(`/exercise/${part}/${exercise.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {bodyPart?.name} Exercises
            </h1>

            <p className="text-muted-foreground">
              {allExercises.length} exercises
              {customExercises.length > 0 &&
                ` (${customExercises.length} custom)`}
            </p>
          </div>
        </div>

        {/* Search + Add Button */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />

            <Input
              type="text"
              placeholder="Search exercises..."
              className="pl-10 bg-card border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Custom Exercise
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Add Custom Exercise
                </DialogTitle>

                <DialogDescription className="text-muted-foreground">
                  Create your own exercise for {bodyPart?.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="exerciseName"
                    className="text-foreground"
                  >
                    Exercise Name
                  </Label>

                  <Input
                    id="exerciseName"
                    placeholder="e.g., Cable Crossover Variation"
                    value={customExerciseName}
                    onChange={(e) =>
                      setCustomExerciseName(e.target.value)
                    }
                    className="bg-background border-border"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddCustomExercise()
                    }
                  />
                </div>

                <Button
                  onClick={handleAddCustomExercise}
                  disabled={saving}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {saving ? "Adding..." : "Add Exercise"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Exercise List */}
        <div className="space-y-3">
          {filteredExercises.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2">
              <p className="text-muted-foreground">
                No exercises found
              </p>

              <p className="text-sm text-muted-foreground mt-1">
                Try a different search or add a custom exercise
              </p>
            </Card>
          ) : (
            filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                onClick={() => handleExerciseClick(exercise)}
              >
                <Card className="p-4 bg-card hover:bg-card/80 border-border transition-all hover:scale-[1.02] cursor-pointer overflow-hidden group">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={exercise.image || "/placeholder.svg"}
                        alt={exercise.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      {exercise.isCustom && (
                        <div className="absolute top-1 right-1 bg-secondary text-background text-xs px-2 py-0.5 rounded-full font-semibold">
                          Custom
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {exercise.name}
                      </h3>

                      <p className="text-sm text-muted-foreground capitalize">
                        {exercise.bodyPart || part}
                        {exercise.isCustom && " • Your Exercise"}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      Start
                    </Button>
                  </div>
                </Card>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ExerciseList;