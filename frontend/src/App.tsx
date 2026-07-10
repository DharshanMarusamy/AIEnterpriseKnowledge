// React is imported implicitly with Vite/React 17+
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './store/AuthContext';

// Layouts
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Auth Pages
import { SplashScreen } from './pages/auth/SplashScreen';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { OTPVerificationPage } from './pages/auth/OTPVerificationPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Main Pages
import { Dashboard } from './components/Dashboard';
import { ChatInterface } from './components/ChatInterface';
import { DocumentUpload } from './components/DocumentUpload';
import { KnowledgeBase } from './components/KnowledgeBase';
import { UsersManagement } from './components/UsersManagement';
import { Settings } from './components/Settings';
import { Bookmarks } from './components/Bookmarks';
import { Analytics } from './components/Analytics';
import { Reports } from './components/Reports';
import { Departments } from './components/Departments';
import { AgentMonitor } from './components/AgentMonitor';
import { Profile } from './components/Profile';
import { Integrations } from './components/Integrations';
import { ChatHistory } from './components/ChatHistory';
import { HelpCenter } from './components/HelpCenter';
import { Notifications } from './components/Notifications';

const queryClient = new QueryClient();

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8 animate-fade-in">
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{title}</h1>
    <div className="glass-card p-6 border border-dashed border-slate-300 dark:border-slate-700 bg-transparent flex items-center justify-center h-64">
      <p className="text-slate-500 dark:text-slate-400">This module is currently being built.</p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Authentication Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/splash" element={<SplashScreen />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/otp-verification" element={<OTPVerificationPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Protected Main Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/chat" element={<ChatInterface />} />
                <Route path="/documents" element={<KnowledgeBase />} />
                <Route path="/upload" element={<DocumentUpload />} />
                <Route path="/knowledge" element={<KnowledgeBase />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/history" element={<ChatHistory />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/users" element={<UsersManagement />} />
                <Route path="/roles" element={<UsersManagement />} />
                <Route path="/departments" element={<Departments />} />
                <Route path="/agent-monitor" element={<AgentMonitor />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/notifications" element={<Notifications />} />
                
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/security" element={<Settings />} />
                <Route path="/audit-logs" element={<Settings />} />
                
                <Route path="/help" element={<HelpCenter />} />
              </Route>
            </Route>

            {/* Catch all redirect to splash/login */}
            <Route path="*" element={<Navigate to="/splash" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
