import { Outlet } from 'react-router-dom';
import { AuthStatus } from '../AuthStatus';

export function MainLayout() {
  return (
    <div className="app-layout">
      <header className="app-layout__header">
        <div className="app-layout__title">TODO</div>
        {/* Temporary: show auth status for debugging */}
        <AuthStatus />
      </header>

      <main className="app-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
