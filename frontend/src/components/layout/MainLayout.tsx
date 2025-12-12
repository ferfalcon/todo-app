import { Outlet } from 'react-router-dom';
import { AuthStatus } from '../AuthStatus';
import { LogoutButton } from '../auth/LogoutButton';

export function MainLayout() {
  return (
    <div className="app-layout">
      <header className="app-layout__header">
        <div className="app-layout__title">TODO</div>

        <div className="app-layout__header-right">
          <AuthStatus />
          <LogoutButton />
        </div>
      </header>

      <main className="app-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
