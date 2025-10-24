import { useState } from "react";
import { Search, Plus, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { bodyParts } from "@/data/dummyData";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/context/AuthProvider";
import gymBg from "@/assets/gym-bg.jpg"

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const filteredBodyParts = bodyParts.filter((part) =>
    part.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Extract first name from full name or email
  const getFirstName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "User";
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 opacity-20">
        <img 
          src={gymBg} 
          alt="Gym background" 
          className="w-full h-full object-cover animate-float"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6 relative z-10">
        {/* Header with Welcome Message */}
        <div className="pt-4 space-y-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <Dumbbell className="h-6 w-6 text-background" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <h1 className="text-2xl font-bold text-foreground animate-fade-in">
                {getFirstName()} 👋
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">Ready to crush your workout today?</p>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-focus-within:text-primary" />
          <Input
            type="text"
            placeholder="Search exercises..."
            className="pl-10 bg-card/50 backdrop-blur-sm border-border focus:border-primary transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Body Parts Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Choose Body Part</h2>
            <span className="text-sm text-muted-foreground">{filteredBodyParts.length} exercises</span>
          </div>
          
          {filteredBodyParts.length === 0 ? (
            <Card className="p-8 bg-card/50 backdrop-blur-sm border-dashed border-2 border-border text-center">
              <p className="text-muted-foreground">No exercises found</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredBodyParts.map((part, index) => (
                <Link key={part.id} to={`/exercises/${part.id}`}>
                  <Card 
                    className="group relative p-6 bg-card/70 backdrop-blur-sm hover:bg-card border-border transition-all hover:scale-105 hover:shadow-xl cursor-pointer animate-scale-in overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-secondary/0 group-hover:from-primary/10 group-hover:to-secondary/10 transition-all duration-300" />
                    
                    <div className="relative flex flex-col items-center gap-3">
                      <span 
                        className="text-5xl animate-float group-hover:scale-110 transition-transform duration-300" 
                        style={{ animationDelay: `${index * 0.2}s` }}
                      >
                        {part.icon}
                      </span>
                      <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {part.name}
                      </span>
                      
                      {/* Exercise Count Badge */}
                      {/* <span className="absolute top-2 right-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                        {part.exercises?.length || 0}
                      </span> */}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 via-card/50 to-secondary/10 backdrop-blur-sm border-primary/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Today's Goal</p>
              <p className="text-2xl font-bold text-foreground">Let's get started! 💪</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg animate-pulse-glow">
              <Dumbbell className="h-8 w-8 text-background" />
            </div>
          </div>
        </Card>

        {/* Motivational Quote */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground italic">
            "The only bad workout is the one that didn't happen"
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
