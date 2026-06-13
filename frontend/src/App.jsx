import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FullPageLoader } from './components/common/LoadingSpinner';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import ApplicationPage from './pages/student/ApplicationPage';
import PaymentsPage from './pages/student/PaymentsPage';
import ProfilePage from './pages/student/ProfilePage';
import NotificationsPage from './pages/student/NotificationsPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ApplicationsPage from './pages/admin/ApplicationsPage';
import ApplicationDetailPage from './pages/admin/ApplicationDetailPage';
import PaymentsAdminPage from './pages/admin/PaymentsAdminPage';
import StudentsAdminPage from './pages/admin/StudentsAdminPage';
import UsersAdminPage from './pages/admin/UsersAdminPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import NotifyStudentsPage from './pages/admin/NotifyStudentsPage';

import AboutPage from './pages/AboutPage';

// ─── Protected route wrappers ──────────────────────────────
const RequireAuth = ({ children, role }) => {
  const { user, loading } = useAuth();
  // While validating existing token, show children if we have cached user
  if (loading && !user) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
};

const GuestOnly = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
};

// ─── App routes ────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
    <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
    <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
    <Route path="/reset-password/:token" element={<GuestOnly><ResetPassword /></GuestOnly>} />

    {/* Student routes */}
    <Route path="/dashboard" element={<RequireAuth role="student"><StudentLayout /></RequireAuth>}>
      <Route index element={<StudentDashboard />} />
      <Route path="application" element={<ApplicationPage />} />
      <Route path="payments" element={<PaymentsPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="about" element={<AboutPage />} />
    </Route>

    {/* Admin routes */}
    <Route path="/admin" element={<RequireAuth role="admin"><AdminLayout /></RequireAuth>}>
      <Route index element={<AdminDashboard />} />
      <Route path="applications" element={<ApplicationsPage />} />
      <Route path="applications/:id" element={<ApplicationDetailPage />} />
      <Route path="payments" element={<PaymentsAdminPage />} />
      <Route path="students" element={<StudentsAdminPage />} />
      <Route path="users" element={<UsersAdminPage />} />
      <Route path="audit-logs" element={<AuditLogsPage />} />
      <Route path="notifications" element={<NotifyStudentsPage />} />
      <Route path="about" element={<AboutPage />} />
    </Route>

    {/* 404 */}
    <Route path="*" element={
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-4xl font-bold text-gray-300">404</h1>
        <p className="text-gray-500">Page not found</p>
        <a href="/" className="text-primary-600 hover:underline">Go home</a>
      </div>
    } />
  </Routes>
);

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
