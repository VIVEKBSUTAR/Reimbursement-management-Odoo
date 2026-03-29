import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Layout from './components/Layout';

// Admin Pages
import TeamManagement from './pages/admin/TeamManagement';
import ApprovalRulesEngine from './pages/admin/ApprovalRulesEngine';
import CompanyExpenses from './pages/admin/CompanyExpenses';

// Employee Pages
import MyExpenses from './pages/employee/MyExpenses';
import AddExpense from './pages/employee/AddExpense';
import Settings from './pages/employee/Settings';

// Manager Pages
import ApprovalsQueue from './pages/manager/ApprovalsQueue';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') return <Navigate to="/admin/team" replace />;
    if (user.role === 'manager') return <Navigate to="/approvals" replace />;
    return <Navigate to="/my-expenses" replace />;
  }
  
  return children;
}

// App Routes Component (uses auth context)
function AppRoutes() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  // Not logged in - show login page
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
  
  // Logged in - show appropriate routes
  return (
    <Layout>
      <Routes>
        {/* Admin Routes */}
        <Route 
          path="/admin/team" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TeamManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/rules" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ApprovalRulesEngine />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/expenses" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CompanyExpenses />
            </ProtectedRoute>
          } 
        />
        
        {/* Manager Routes */}
        <Route 
          path="/approvals" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <ApprovalsQueue />
            </ProtectedRoute>
          } 
        />
        
        {/* Employee Routes (accessible by all) */}
        <Route 
          path="/my-expenses" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'employee']}>
              <MyExpenses />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/add-expense" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'employee']}>
              <AddExpense />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'employee']}>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        {/* Default redirects based on role */}
        <Route 
          path="/" 
          element={
            user.role === 'admin' ? <Navigate to="/admin/team" replace /> :
            user.role === 'manager' ? <Navigate to="/approvals" replace /> :
            <Navigate to="/my-expenses" replace />
          } 
        />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
