import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Dumbbell, TrendingUp, Activity } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center space-y-6 border-2 border-border/50 shadow-2xl">
        {/* Animated Dumbbell Icon */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
          </div>
          <div className="relative flex items-center justify-center">
            <Dumbbell className="h-24 w-24 text-primary animate-bounce" strokeWidth={1.5} />
          </div>
        </div>

        {/* 404 Title */}
        <div className="space-y-2">
          <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-gradient bg-[length:200%_auto]">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Workout Not Found! 💪
          </h2>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Looks like you've wandered off the training path. This page doesn't exist in our gym!
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 text-destructive animate-pulse" />
            <span className="font-mono text-destructive">
              Error on route: <code className="bg-muted px-2 py-0.5 rounded">{location.pathname}</code>
            </span>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="py-4 px-6 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm italic text-primary font-medium">
            "Every champion was once a contender that refused to give up."
          </p>
          <p className="text-xs text-muted-foreground mt-1">— Rocky Balboa</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            onClick={() => navigate("/")}
            size="lg"
            className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
          <Button
            onClick={() => navigate("/summary")}
            variant="outline"
            size="lg"
            className="border-2 hover:bg-secondary/10 hover:border-secondary transition-all"
          >
            <TrendingUp className="mr-2 h-5 w-5" />
            View Progress
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-6 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-3">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-xs"
            >
              🏋️ Workouts
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/summary")}
              className="text-xs"
            >
              📊 Summary
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/exercises")}
              className="text-xs"
            >
              💪 Exercises
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/profile")}
              className="text-xs"
            >
              👤 Profile
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center gap-8 pt-4 opacity-20">
          <Dumbbell className="h-8 w-8 text-primary rotate-45" />
          <Dumbbell className="h-8 w-8 text-secondary -rotate-45" />
          <Dumbbell className="h-8 w-8 text-primary rotate-45" />
        </div>
      </Card>

      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default NotFound;
