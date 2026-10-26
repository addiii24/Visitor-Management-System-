import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import GuardDashboard from './pages/guard/GuardDashboard';
import RegisterVisitorPage from './pages/guard/RegisterVisitorPage';
import VisitorListPage from './pages/guard/VisitorListPage';
import CheckInOutPage from './pages/guard/CheckInOutPage';
import PlantHeadDashboard from './pages/planthead/PlantHeadDashboard';
import ApprovalRequestsPage from './pages/planthead/ApprovalRequestsPage';
import ApprovedVisitorsPage from './pages/planthead/ApprovedVisitorsPage';
import AllRequestsPage from './pages/planthead/AllRequestsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import VisitorRecordsPage from './pages/admin/VisitorRecordsPage';
import ReportsPage from './pages/admin/ReportsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import CompanySettingsPage from './pages/admin/CompanySettingsPage';

// Protected route wrapper
function ProtectedRoute({ allowedRoles }) {
  const { currentUser, loading } = useApp();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-[#1e3a5f] mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to their proper dashboard
    const roleRoutes = { guard: '/guard', planthead: '/planthead', admin: '/admin' };
    return <Navigate to={roleRoutes[currentUser.role] || '/login'} replace />;
  }
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function RootRedirect() {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  const roleRoutes = { guard: '/guard', planthead: '/planthead', admin: '/admin' };
  return <Navigate to={roleRoutes[currentUser.role] || '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Guard routes */}
          <Route element={<ProtectedRoute allowedRoles={['guard']} />}>
            <Route path="/guard" element={<GuardDashboard />} />
            <Route path="/guard/register" element={<RegisterVisitorPage />} />
            <Route path="/guard/visitors" element={<VisitorListPage />} />
            <Route path="/guard/checkin" element={<CheckInOutPage />} />
          </Route>

          {/* Plant Head routes */}
          <Route element={<ProtectedRoute allowedRoles={['planthead']} />}>
            <Route path="/planthead" element={<PlantHeadDashboard />} />
            <Route path="/planthead/requests" element={<ApprovalRequestsPage />} />
            <Route path="/planthead/approved" element={<ApprovedVisitorsPage />} />
            <Route path="/planthead/all" element={<AllRequestsPage />} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/visitors" element={<VisitorRecordsPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/audit" element={<AuditLogsPage />} />
            <Route path="/admin/settings" element={<CompanySettingsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
