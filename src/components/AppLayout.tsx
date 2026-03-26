import { Outlet, Navigate } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import { getCurrentUser } from '@/lib/store';

export default function AppLayout() {
  if (!getCurrentUser()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
