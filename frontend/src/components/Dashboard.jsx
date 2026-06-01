import React from 'react';
import { Outlet } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="flex flex-col max-w-7xl mx-auto my-8 px-4 w-full relative">
      {/* Main Content Area without side-menu */}
      <div className="flex-1 w-full relative">
        <Outlet />
      </div>
    </div>
  );
}
