import { Outlet } from 'react-router-dom';
import React from 'react';
import useAuth  from '../hooks/useAuth.js';
import { Navigate } from 'react-router-dom';

const ProtectedLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default ProtectedLayout;