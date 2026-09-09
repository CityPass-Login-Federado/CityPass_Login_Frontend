import { LayoutDashboard, Users, UsersRound } from 'lucide-react';

const navigation = [
  { label: 'Inicio', href: '#top', icon: LayoutDashboard },
  { label: 'ABM de Grupos', href: '#groups', icon: UsersRound },
  { label: 'ABM de Usuarios', href: '#users', icon: Users },
];

export const ManagementSidebar = () => (
  <aside className="hidden min-h-screen w-56 shrink-0 bg-slate-950 px-4 py-7 text-white md:block">
    <div className="border-b border-white/10 px-1 pb-6">
      <div className="font-heading text-xl font-bold">CityPass+</div>
      <p className="mt-1 text-xs text-slate-400">Portal de Administración</p>
    </div>
    <p className="mb-2 mt-7 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
      Administrador
    </p>
    <nav aria-label="Navegación administrativa" className="space-y-1">
      {navigation.map((item, index) => {
        const Icon = item.icon;
        return (
          <a
            key={item.href}
            href={item.href}
            className={
              index === 0
                ? 'flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium'
                : 'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white'
            }
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </a>
        );
      })}
    </nav>
  </aside>
);
