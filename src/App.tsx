import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GeofenceAdmin from './pages/GeofenceAdmin';
import PoliceDashboard from './pages/PoliceDashboard';
import TouristRegistration from './pages/TouristRegistration';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import NotificationContainer from './components/NotificationContainer';
import './styles/App.css';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="app">
      <NotificationContainer />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={user ? <Navigate to="/admin" /> : <Login />} />
        <Route path="/tourist-registration" element={<TouristRegistration />} />
        
        {/* Protected routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/geofence" element={
          <ProtectedRoute>
            <GeofenceAdmin />
          </ProtectedRoute>
        } />
        
        <Route path="/police" element={
          <ProtectedRoute>
            <PoliceDashboard />
          </ProtectedRoute>
        } />
        
        {/* Root redirect */}
        <Route path="/" element={
          user ? <Navigate to="/admin" /> : <Navigate to="/login" />
        } />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;