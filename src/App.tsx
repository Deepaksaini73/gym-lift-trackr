import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ExerciseList from "./pages/ExerciseList";
import ExerciseDetail from "./pages/ExerciseDetail";
import Summary from "./pages/Summary";
import Profile from "./pages/Profile";
import Workout from "./pages/Workout";
import Login from "./pages/Login";
import ProgressPhotos from "./pages/ProgressPhotos";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/context/AuthProvider";
import RequireAuth from "@/components/RequireAuth";
import { InstallPrompt } from "@/components/InstallPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OfflineIndicator />
        <InstallPrompt />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route element={<RequireAuth />}>
              <Route path="/" element={<Home />} />
              <Route path="/exercises/:part" element={<ExerciseList />} />
              <Route path="/exercise/:bodyPart/:id" element={<ExerciseDetail />} />
              <Route path="/summary" element={<Summary />} />
              <Route path="/progress" element={<ProgressPhotos />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/workout" element={<Workout />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
