import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { HomeDashboard } from './pages/HomeDashboard';
import { NewspaperLibrary } from './pages/NewspaperLibrary';
import { UpscHub } from './pages/UpscHub';
import { AiResearch } from './pages/AiResearch';
import { MyDocuments } from './pages/MyDocuments';
import { SavedArticles } from './pages/SavedArticles';
import { AdminDashboard } from './pages/AdminDashboard';
import { NewsFeed } from './pages/NewsFeed';
import { FeedbackPage } from './pages/FeedbackPage';

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Main Layout Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<HomeDashboard />} />
            <Route path="/news" element={<NewsFeed />} />
            <Route path="/news/:id" element={<NewsFeed />} />
            <Route path="/newspapers" element={<NewspaperLibrary />} />
            <Route path="/upsc" element={<UpscHub />} />
            <Route path="/upsc/current-affairs" element={<UpscHub />} />
            <Route path="/upsc/daily-brief" element={<UpscHub />} />
            <Route path="/upsc/prelims" element={<UpscHub />} />
            <Route path="/upsc/mains" element={<UpscHub />} />
            <Route path="/ai/research" element={<AiResearch />} />
            <Route path="/ai/analysis/:id" element={<AiResearch />} />
            <Route path="/documents" element={<MyDocuments />} />
            <Route path="/saved" element={<SavedArticles />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/search" element={<HomeDashboard />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Route>

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
