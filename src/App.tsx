import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/lib/i18n";
import RequireAdmin from "@/components/RequireAdmin";
import WelcomeScreen from "./pages/WelcomeScreen";
import QuizPage from "./pages/QuizPage";
import ResultScreen from "./pages/ResultScreen";
import AboutPage from "./pages/AboutPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReport from "./pages/AdminReport";
import NotFound from "./pages/NotFound";
import ThanksPage from "./pages/ThanksPage";
import AdminLogin from "./pages/AdminLogin";
import PrivacyPage from "./pages/PrivacyPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LocaleProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/result/:id" element={<ResultScreen />} />
            <Route path="/thanks" element={<ThanksPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin/report/:id"
              element={
                <RequireAdmin>
                  <AdminReport />
                </RequireAdmin>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LocaleProvider>
  </QueryClientProvider>
);

export default App;
