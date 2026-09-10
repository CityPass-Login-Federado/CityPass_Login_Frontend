import { LayoutDashboard, Users, UsersRound } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { id: 'home', label: 'Inicio', to: '/panel', icon: LayoutDashboard },
  { id: 'groups', label: 'ABM de Grupos', to: '/panel#groups', icon: UsersRound },
  { id: 'users', label: 'ABM de Usuarios', to: '/panel/users', icon: Users },
];

const useActiveNavigationItem = () => {
  const location = useLocation();

  if (location.pathname === '/panel/users') return 'users';
  if (location.hash === '#groups') return 'groups';
  return 'home';
};

const NavigationLinks = ({ compact = false }: { compact?: boolean }) => {
  const activeItem = useActiveNavigationItem();

  return (
    <nav
      aria-label="Navegación administrativa"
      className={compact ? 'flex min-w-max gap-2' : 'space-y-1'}
    >
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === activeItem;
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={isActive ? 'page' : undefined}
            className={
              isActive
                ? 'flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white'
                : 'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white'
            }
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

export const ManagementSidebar = () => (
  <>
    <aside className="hidden min-h-screen w-56 shrink-0 bg-slate-950 px-4 py-7 text-white md:block">
      <div className="border-b border-white/10 px-1 pb-6">
        <div className="font-heading text-xl font-bold">CityPass+</div>
        <p className="mt-1 text-xs text-slate-400">Portal de Administración</p>
      </div>
      <p className="mb-2 mt-7 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Administrador
      </p>
      <NavigationLinks />
    </aside>

    <div className="overflow-x-auto bg-slate-950 px-4 py-3 text-white md:hidden">
      <NavigationLinks compact />
    </div>
  </>
);
