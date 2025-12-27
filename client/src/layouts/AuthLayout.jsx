import { Outlet } from 'react-router-dom';
import React from 'react';

const AuthLayout = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Outlet />
    </div>
  );
};

export default AuthLayout;