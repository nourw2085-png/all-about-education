import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import RoleRoute from "@/components/auth/RoleRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Chat from "./pages/Chat";
import Materials from "./pages/Materials";
import Assignments from "./pages/Assignments";
import Attendance from "./pages/Attendance";
import Students from "./pages/Students";
import Assistants from "./pages/Assistants";
import MyChild from "./pages/MyChild";
import DailyQuiz from "./pages/DailyQuiz";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Chat: students, assistants, teachers (read-only monitoring) */}
            <Route path="/chat" element={
              <RoleRoute allow={['student', 'assistant', 'teacher']}><Chat /></RoleRoute>
            } />
            {/* Legacy /questions route → chat */}
            <Route path="/questions" element={
              <RoleRoute allow={['student', 'assistant', 'teacher']}><Chat /></RoleRoute>
            } />

            <Route path="/materials" element={
              <RoleRoute allow={['student', 'assistant', 'teacher']}><Materials /></RoleRoute>
            } />
            <Route path="/assignments" element={
              <RoleRoute allow={['student', 'assistant', 'teacher']}><Assignments /></RoleRoute>
            } />
            <Route path="/attendance" element={
              <RoleRoute allow={['student', 'assistant', 'teacher', 'parent']}><Attendance /></RoleRoute>
            } />
            <Route path="/students" element={
              <RoleRoute allow={['teacher', 'assistant']}><Students /></RoleRoute>
            } />
            <Route path="/assistants" element={
              <RoleRoute allow={['teacher']}><Assistants /></RoleRoute>
            } />
            <Route path="/my-child" element={
              <RoleRoute allow={['parent']}><MyChild /></RoleRoute>
            } />
            <Route path="/daily-quiz" element={
              <RoleRoute allow={['student']}><DailyQuiz /></RoleRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
