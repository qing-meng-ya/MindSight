import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import PortalHome from './pages/PortalHome';
import PortalNodePage from './pages/PortalNodePage';
import Profile from './pages/Profile';
import Register from './pages/Register';
import { useAuth } from './services/AuthContext';

const RequireAuth = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const GuestOnly = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <Register />
          </GuestOnly>
        }
      />
      <Route path="/" element={<Layout />}>
        <Route index element={<PortalHome />} />
        <Route path="portal/:role" element={<PortalNodePage />} />
        <Route path="portal/:role/*" element={<PortalNodePage />} />
        <Route
          path="profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route path="*" element={<PortalHome />} />
      </Route>
    </Routes>
  );
};

export default App;
