import { Outlet } from 'react-router-dom';

export function MainLayout() {
  return (
    <div className="app-layout">
      <header className="app-layout__header">
        <div className="app-layout__title">TODO</div>
      </header>

      <main className="app-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
