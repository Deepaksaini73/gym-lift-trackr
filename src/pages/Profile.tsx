import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Trophy,
  Target,
  Flame,
  Award,
  LogOut,
  User,
  TrendingUp,
  Calendar,
  Dumbbell,
  Timer,
  BarChart3,
  Crown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  weight: number | null;
  height: number | null;
  goal: string | null;
  streak: number;
  created_at: string;
  avatar_url: string | null;
};

type WorkoutStats = {
  totalWorkouts: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  averageSessionDuration: number;
  mostFrequentBodyPart: string;
  topExercises: Array<{ name: string; count: number; pr: number }>;
  personalRecords: Array<{ exercise: string; weight: number; date: string }>;
  weeklyGoalProgress: number;
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
};

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Edit form state
  const [fullName, setFullName] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfileAndStats();
    }
  }, [user]);

  const fetchProfileAndStats = async () => {
    setLoading(true);
    await Promise.all([fetchProfile(), fetchWorkoutStats()]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        // Get avatar from Google if available
        const avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          data.avatar_url ||
          null;

        setProfile({
          ...data,
          avatar_url: avatarUrl,
        });
        setFullName(data.full_name || "");
        setWeight(data.weight?.toString() || "");
        setHeight(data.height?.toString() || "");
        setGoal(data.goal || "");
      } else {
        // Create profile if doesn't exist
        const avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null;

        const newProfile = {
          id: user.id,
          email: user.email,
          full_name:
            user.user_metadata?.full_name || user.user_metadata?.name || null,
          weight: null,
          height: null,
          goal: null,
          streak: 0,
          avatar_url: avatarUrl,
        };

        const { error: insertError } = await supabase
          .from("users")
          .insert(newProfile);

        if (!insertError) {
          // Also create/update profiles table
          await supabase.from("profiles").upsert({
            id: user.id,
            full_name: newProfile.full_name,
            username:
              newProfile.full_name?.toLowerCase().replace(/\s+/g, "_") || null,
            avatar_url: avatarUrl,
          });

          fetchProfile();
        }
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    }
  };

  const fetchWorkoutStats = async () => {
    if (!user) return;

    try {
      // Fetch all user's workout logs
      const { data: workoutData, error } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!workoutData || workoutData.length === 0) {
        setStats({
          totalWorkouts: 0,
          totalVolume: 0,
          totalSets: 0,
          totalReps: 0,
          averageSessionDuration: 0,
          mostFrequentBodyPart: "—",
          topExercises: [],
          personalRecords: [],
          weeklyGoalProgress: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalDaysActive: 0,
        });
        return;
      }

      // Calculate total workouts
      const totalWorkouts = workoutData.length;

      // Calculate total volume, sets, and reps
      let totalVolume = 0;
      let totalSets = 0;
      let totalReps = 0;

      workoutData.forEach((log) => {
        log.sets.forEach((set: any) => {
          totalVolume += set.reps * set.weight;
          totalSets += 1;
          totalReps += set.reps;
        });
      });

      // Find most frequent body part
      const bodyPartCount = new Map<string, number>();
      workoutData.forEach((log) => {
        bodyPartCount.set(
          log.body_part,
          (bodyPartCount.get(log.body_part) || 0) + 1
        );
      });
      const mostFrequentBodyPart = Array.from(bodyPartCount.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] || "—";

      // Find top exercises
      const exerciseMap = new Map<string, { count: number; pr: number }>();
      workoutData.forEach((log) => {
        const existing = exerciseMap.get(log.exercise_name) || { count: 0, pr: 0 };
        exerciseMap.set(log.exercise_name, {
          count: existing.count + 1,
          pr: Math.max(existing.pr, log.max_weight),
        });
      });

      const topExercises = Array.from(exerciseMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Personal records (top PRs)
      const personalRecords = Array.from(exerciseMap.entries())
        .map(([exercise, data]) => {
          const logWithPR = workoutData.find(
            (log) => log.exercise_name === exercise && log.max_weight === data.pr
          );
          return {
            exercise,
            weight: data.pr,
            date: logWithPR
              ? new Date(logWithPR.created_at).toLocaleDateString()
              : "—",
          };
        })
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 5);

      // Calculate streaks
      const workoutDates = workoutData
        .map((log) => new Date(log.created_at).toISOString().split("T")[0])
        .filter((date, index, self) => self.indexOf(date) === index)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      // Current streak
      if (workoutDates.includes(today) || workoutDates.includes(yesterday)) {
        let checkDate = workoutDates.includes(today) ? new Date() : new Date(Date.now() - 86400000);
        
        for (let i = 0; i < workoutDates.length; i++) {
          const dateStr = checkDate.toISOString().split("T")[0];
          if (workoutDates.includes(dateStr)) {
            currentStreak++;
            checkDate = new Date(checkDate.getTime() - 86400000);
          } else {
            break;
          }
        }
      }

      // Longest streak
      for (let i = 0; i < workoutDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prevDate = new Date(workoutDates[i - 1]);
          const currDate = new Date(workoutDates[i]);
          const diffDays = Math.floor(
            (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      // Total days active
      const totalDaysActive = workoutDates.length;

      // Weekly goal progress (assume goal is 4 workouts per week)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const thisWeekWorkouts = workoutData.filter(
        (log) => new Date(log.created_at) >= oneWeekAgo
      ).length;
      const weeklyGoalProgress = Math.min((thisWeekWorkouts / 4) * 100, 100);

      setStats({
        totalWorkouts,
        totalVolume,
        totalSets,
        totalReps,
        averageSessionDuration: 45, // Mock for now
        mostFrequentBodyPart,
        topExercises,
        personalRecords,
        weeklyGoalProgress,
        currentStreak,
        longestStreak,
        totalDaysActive,
      });
    } catch (error) {
      console.error("Error fetching workout stats:", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      const trimmedName = fullName.trim();
      const updateData = {
        full_name: trimmedName || null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        goal: goal.trim() || null,
      };

      console.log("Updating profile with data:", updateData);

      // Update users table
      const { error: usersError } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id);

      if (usersError) {
        console.error("Users table update error:", usersError);
        throw usersError;
      }

      console.log("Users table updated successfully");

      // Check if profile exists first
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking profile:", checkError);
      }

      const profileData = {
        id: user.id,
        full_name: trimmedName || null,
        username: trimmedName?.toLowerCase().replace(/\s+/g, "_") || null,
        avatar_url: profile?.avatar_url || null,
      };

      console.log("Profile data to upsert:", profileData);

      if (existingProfile) {
        // Update existing profile
        const { error: profilesError } = await supabase
          .from("profiles")
          .update({
            full_name: trimmedName || null,
            username: trimmedName?.toLowerCase().replace(/\s+/g, "_") || null,
            avatar_url: profile?.avatar_url || null,
          })
          .eq("id", user.id);

        if (profilesError) {
          console.error("Profiles table update error:", profilesError);
        } else {
          console.log("Profiles table updated successfully");
        }
      } else {
        // Insert new profile
        const { error: profilesError } = await supabase
          .from("profiles")
          .insert(profileData);

        if (profilesError) {
          console.error("Profiles table insert error:", profilesError);
        } else {
          console.log("Profiles table inserted successfully");
        }
      }

      toast({
        title: "Success! 🎉",
        description: "Profile updated successfully",
      });

      await fetchProfileAndStats();
      setEditOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getBMI = () => {
    if (!profile?.weight || !profile?.height) return null;
    const heightInMeters = profile.height / 100;
    return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return profile?.email?.[0]?.toUpperCase() || "U";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Profile not found</p>
          <Button onClick={fetchProfileAndStats}>Retry</Button>
        </div>
      </div>
    );
  }

  const bmi = getBMI();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Header with Avatar */}
        <div className="pt-2 text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
            {profile.avatar_url && (
              <AvatarImage
                src={profile.avatar_url}
                alt={profile.full_name || "User"}
              />
            )}
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-background text-2xl font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold text-foreground">
            {profile.full_name || "Anonymous User"}
          </h1>
          <p className="text-muted-foreground text-sm">{profile.email}</p>
          {profile.goal && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full">
              <Target className="h-4 w-4" />
              <p className="text-sm font-medium">{profile.goal}</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Member since{" "}
            {new Date(profile.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Weekly Progress */}
        {stats && stats.totalWorkouts > 0 && (
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Weekly Goal</h3>
              </div>
              <span className="text-sm font-bold text-primary">
                {stats.weeklyGoalProgress.toFixed(0)}%
              </span>
            </div>
            <Progress value={stats.weeklyGoalProgress} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              {Math.floor((stats.weeklyGoalProgress / 100) * 4)} of 4 workouts this week
            </p>
          </Card>
        )}

        {/* Streak Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
            <div className="text-center">
              <Flame className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {stats?.currentStreak || 0}
              </p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <div className="text-center">
              <Crown className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {stats?.longestStreak || 0}
              </p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30">
            <div className="text-center">
              <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {stats?.totalDaysActive || 0}
              </p>
              <p className="text-xs text-muted-foreground">Days Active</p>
            </div>
          </Card>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Workouts</p>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {stats?.totalWorkouts || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total sessions</p>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-secondary" />
              <p className="text-sm text-muted-foreground">Volume</p>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {stats ? (stats.totalVolume / 1000).toFixed(0) : 0}k
            </p>
            <p className="text-xs text-muted-foreground mt-1">kg lifted</p>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">Sets</p>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {stats?.totalSets || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total sets</p>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="h-5 w-5 text-secondary" />
              <p className="text-sm text-muted-foreground">Reps</p>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {stats?.totalReps || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total reps</p>
          </Card>
        </div>

        {/* Body Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-1">Weight</p>
            <p className="text-xl font-bold text-foreground">
              {profile.weight ? `${profile.weight}` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">kg</p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-1">Height</p>
            <p className="text-xl font-bold text-foreground">
              {profile.height ? `${profile.height}` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">cm</p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-1">BMI</p>
            <p className="text-xl font-bold text-foreground">{bmi || "—"}</p>
            <p className="text-xs text-muted-foreground">
              {bmi
                ? parseFloat(bmi) < 18.5
                  ? "Low"
                  : parseFloat(bmi) < 25
                  ? "Normal"
                  : parseFloat(bmi) < 30
                  ? "High"
                  : "Obese"
                : "—"}
            </p>
          </Card>
        </div>

        {/* Favorite Body Part */}
        {stats && stats.mostFrequentBodyPart !== "—" && (
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Most Trained
              </h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary capitalize">
                {stats.mostFrequentBodyPart}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Body part</p>
            </div>
          </Card>
        )}

        {/* Top 5 Exercises */}
        {stats && stats.topExercises.length > 0 && (
          <Card className="p-4 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Top Exercises
            </h3>
            <div className="space-y-2">
              {stats.topExercises.map((exercise, index) => (
                <div
                  key={exercise.name}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {index === 0
                        ? "🥇"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : `#${index + 1}`}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {exercise.count} sessions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{exercise.pr} kg</p>
                    <p className="text-xs text-muted-foreground">PR</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Personal Records */}
        {stats && stats.personalRecords.length > 0 && (
          <Card className="p-4 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-secondary" />
              Personal Records
            </h3>
            <div className="space-y-2">
              {stats.personalRecords.map((record, index) => (
                <div
                  key={record.exercise}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-lg border border-secondary/20"
                >
                  <div>
                    <p className="font-medium text-foreground">{record.exercise}</p>
                    <p className="text-xs text-muted-foreground">{record.date}</p>
                  </div>
                  <p className="text-xl font-bold text-secondary">{record.weight} kg</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {stats && stats.totalWorkouts === 0 && (
          <Card className="p-8 text-center border-dashed border-2">
            <Dumbbell className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Start Your Fitness Journey
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Log your first workout to see detailed stats!
            </p>
            <Button onClick={() => navigate("/")}>Go to Home</Button>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Update your personal information and fitness goals
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="75"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="180"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="goal">Fitness Goal</Label>
                  <Input
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="Build muscle and strength"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateProfile} disabled={updating}>
                  {updating ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
