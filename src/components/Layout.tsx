import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const Layout = () => (
  <div className="min-h-screen bg-gray-100 flex flex-col">
    <Navbar />
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  </div>
);