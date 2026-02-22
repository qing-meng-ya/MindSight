import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Diagnosis from './pages/Diagnosis';
import History from './pages/History';
import Admin from './pages/Admin';
import Layout from './components/Layout';
import ForensicClinical from './pages/ForensicClinical';
import ForensicPathology from './pages/ForensicPathology';
import ForensicToxicology from './pages/ForensicToxicology';
import ForensicPsychiatry from './pages/ForensicPsychiatry';
import ForensicEvidence from './pages/ForensicEvidence';
import ExpertConsult from './pages/ExpertConsult';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">加载中...</div>;
  }
  
  if (requireAuth && !user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">加载中...</div>;
  }
  
  if (user) {
    return <Navigate to="/" />;
  }
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute requireAuth={false}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="clinical" element={
            <ProtectedRoute>
              <ForensicClinical />
            </ProtectedRoute>
          } />
          <Route path="pathology" element={
            <ProtectedRoute>
              <ForensicPathology />
            </ProtectedRoute>
          } />
          <Route path="toxicology" element={
            <ProtectedRoute requireAuth={false}>
              <ForensicToxicology />
            </ProtectedRoute>
          } />
          <Route path="psychiatry" element={
            <ProtectedRoute requireAuth={false}>
              <ForensicPsychiatry />
            </ProtectedRoute>
          } />
          <Route path="evidence" element={
            <ProtectedRoute requireAuth={false}>
              <ForensicEvidence />
            </ProtectedRoute>
          } />
          <Route path="expert" element={
            <ProtectedRoute requireAuth={false}>
              <ExpertConsult />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="diagnosis" element={
            <ProtectedRoute>
              <Diagnosis />
            </ProtectedRoute>
          } />
          <Route path="history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
          <Route path="admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
