import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import CreateExpense from './pages/CreateExpense';
import EditExpense from './pages/EditExpense';
import ExpenseDetail from './pages/ExpenseDetail';
import Budgets from './pages/Budgets';
import CreateBudget from './pages/CreateBudget';
import EditBudget from './pages/EditBudget';
import Families from './pages/Families';
import Settings from './pages/Settings';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route component (redirects to dashboard if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/" /> : <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <Layout>
              <Expenses />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses/new"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateExpense />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ExpenseDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <EditExpense />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/budgets"
        element={
          <ProtectedRoute>
            <Layout>
              <Budgets />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/budgets/new"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateBudget />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/budgets/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <EditBudget />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/families"
        element={
          <ProtectedRoute>
            <Layout>
              <Families />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
