import { Home, BarChart3, Dumbbell, User, Camera } from "lucide-react";
import { NavLink } from "react-router-dom";

export const BottomNav = () => {
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BarChart3, label: "Summary", path: "/summary" },
    { icon: Dumbbell, label: "Workout", path: "/workout" },
    { icon: Camera, label: "Progress", path: "/progress" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
