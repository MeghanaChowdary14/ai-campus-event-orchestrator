import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EventList from './pages/EventList';
import EventCreate from './pages/EventCreate';
import EventDetail from './pages/EventDetail';
import TaskManagement from './pages/TaskManagement';
import VenueManagement from './pages/VenueManagement';
import ResourceInventory from './pages/ResourceInventory';
import NotificationsPage from './pages/NotificationsPage';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EventList />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/events/create"
              element={
                <ProtectedRoute allowedRoles={['Coordinator']}>
                  <AppLayout>
                    <EventCreate />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/events/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EventDetail />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TaskManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/venues"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <VenueManagement />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ResourceInventory />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <NotificationsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
