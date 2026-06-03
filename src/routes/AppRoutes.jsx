import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';

// Pages
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { Documents } from '../pages/Documents';
import { Sharing } from '../pages/Sharing';
import { AuditLogs } from '../pages/AuditLogs';
import { Settings } from '../pages/Settings';
import { Admin } from '../pages/Admin';
import { Support } from '../pages/Support';

// Protected Route Guard (Assume Breach - Always verify session)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f8] dark:bg-[#0f1115]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950 dark:border-slate-800 dark:border-t-white"></div>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Authenticating Session...
          </span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin Route Guard (Least Privilege Access)
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
};

// Guest Route Guard (Redirect logged-in users away from Auth pages)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

// Authenticated layout wrapper
const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#f6f7f8] text-slate-950 transition-colors duration-200 dark:bg-[#0f1115] dark:text-slate-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="relative flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/sharing" element={<Sharing />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/support" element={<Support />} />
            
            {/* Admin only routes */}
            <Route 
              path="/audit-logs" 
              element={
                <AdminRoute>
                  <AuditLogs />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Guest Authentication Pages */}
      <Route 
        path="/login" 
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        } 
      />

      {/* Main Secure Application */}
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};
export default AppRoutes;
