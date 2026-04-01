import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import BotPage from "./pages/Bot";
import ConsultantsPage from "./pages/Consultants";
import TemplatesPage from "./pages/Templates";
import PricingPage from "./pages/Pricing";
import AboutPage from "./pages/About";
import AdminPage from "./pages/Admin";
import SupremeOfficePage from "./pages/SupremeOffice";
import SystemControlPage from "./pages/SystemControl";

const queryClient = new QueryClient();

// ProtectedRoute for System Control - Only bishoysamy390@gmail.com
const AdminOnlyRoute = ({ element }: { element: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">جاري التحميل...</div>;
  }

  if (!user || user.email !== "bishoysamy390@gmail.com") {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/auth/login" element={<LoginPage />} />
    <Route path="/auth/signup" element={<SignupPage />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/bot" element={<BotPage />} />
    <Route path="/consultants" element={<ConsultantsPage />} />
    <Route path="/templates" element={<TemplatesPage />} />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/admin" element={<AdminPage />} />
    <Route path="/supreme-office" element={<SupremeOfficePage />} />
    <Route path="/system-control" element={<AdminOnlyRoute element={<SystemControlPage />} />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FirebaseClientProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Navbar />
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </FirebaseClientProvider>
  </QueryClientProvider>
);

export default App;
