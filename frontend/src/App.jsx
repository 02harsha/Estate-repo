import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthContainer from './components/Auth/AuthContainer';
import HomeScreen from './components/Dashboard/HomeScreen';
import Particles from './components/Particles';
import { Toaster } from 'react-hot-toast';
import AboutUs from './components/Pages/AboutUs';
import Services from './components/Pages/Services';
import Contact from './components/Pages/Contact';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  return (
    <>
      <Particles />
      <Toaster position="bottom-center" toastOptions={{
        className: 'toast',
        style: {
          background: 'var(--card-bg)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)'
        }
      }} />
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <AuthContainer />
          </PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <HomeScreen />
          </ProtectedRoute>
        } />
        <Route path="/about" element={
          <ProtectedRoute>
            <AboutUs />
          </ProtectedRoute>
        } />
        <Route path="/services" element={
          <ProtectedRoute>
            <Services />
          </ProtectedRoute>
        } />
        <Route path="/contact" element={
          <ProtectedRoute>
            <Contact />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
