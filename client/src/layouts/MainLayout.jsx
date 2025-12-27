import { Outlet } from 'react-router-dom';
import React from 'react';

const MainLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default MainLayout;