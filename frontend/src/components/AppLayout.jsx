import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, PlusCircle, CheckSquare, CalendarDays, Network, Lightbulb, LayoutTemplate, Settings, Menu, X, PanelLeftClose, PanelLeftOpen, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import NotificationBell from './NotificationBell';
import { applyAccent, applyTheme } from '../lib/theme';
import { setDateFormat } from '../config/projects';

const NAV = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/projetos', label: 'Meus projetos', icon: FolderKanban, end: true, match: (p) => p.startsWith('/app/projetos') && p !== '/app/projetos/novo' },
  { to: '/app/projetos/novo', label: 'Criar projeto', icon: PlusCircle },
  { to: '/app/tarefas', label: 'Tarefas', icon: CheckSquare },
  { to: '/app/calendario', label: 'Calendário', icon: CalendarDays },
  { to: '/app/planejamento', label: 'Planejamento', icon: Network },
  { to: '/app/brainstorm', label: 'Brainstorm', icon: Lightbulb },
  { to: '/app/modelos', label: 'Modelos', icon: LayoutTemplate },
  { to: '/app/configuracoes', label: 'Configurações', icon: Settings },
];

export default function AppLayout() {
  const { user, profile, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const p = profile?.prefs; if (!p) return;
    if (p.theme) applyTheme(p.theme); if (p.accent) applyAccent(p.accent); if (p.dateFormat) setDateFormat(p.dateFormat);
  }, [profile?.prefs]);
  const current = [...NAV].reverse().find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))?.label || (pathname.startsWith('/app/projetos') ? 'Meus projetos' : '');

  const links = (showText) => NAV.map(({ to, label, icon: Icon, end, match }) => (
    <NavLink key={to} to={to} end={end} title={label} onClick={() => setOpen(false)}
      className={({ isActive }) => `flex min-h-[44px] items-center gap-3 rounded px-3 text-sm font-medium ${(match ? match(pathname) : isActive) ? 'bg-brand text-[#171717]' : 'text-muted hover:text-ink hover:bg-bg'}`}>
      <Icon size={18} className="shrink-0" />
      {showText && <span>{label}</span>}
    </NavLink>
  ));

  return (
    <div className="flex min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[70] focus:rounded focus:bg-amber focus:px-3 focus:py-2 focus:text-[#171717]">Pular para o conteúdo</a>
      <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-surface p-3 md:flex ${collapsed ? 'w-[68px]' : 'w-60'}`}>
        <div className="mb-4 flex h-11 items-center justify-between px-2">{!collapsed && <Logo />}
          <button className="text-muted hover:text-ink" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}>
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
        <nav className="flex flex-col gap-1">{links(!collapsed)}</nav>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-line bg-surface p-3 transition-transform md:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-4 flex h-11 items-center justify-between px-2"><Logo />
          <button onClick={() => setOpen(false)} aria-label="Fechar menu"><X size={20} /></button>
        </div>
        <nav className="flex flex-col gap-1">{links(true)}</nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-bg px-4">
          <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu size={22} /></button>
          <p className="font-display text-lg font-semibold">{current}</p>
          <div className="ml-auto flex items-center gap-2">
            <button className="btn-primary !min-h-[36px] !px-3" onClick={() => navigate('/app/projetos/novo')}><PlusCircle size={16} /><span className="hidden sm:inline">Novo projeto</span></button>
            <NotificationBell />
            <span className="grid h-9 w-9 place-items-center rounded-full bg-amber text-sm font-bold text-[#171717]" title={user?.email}>
              {user?.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-9 w-9 rounded-full object-cover" /> : (user?.displayName || user?.email || '?')[0].toUpperCase()}
            </span>
            <button className="text-muted hover:text-ink" onClick={logout} aria-label="Sair"><LogOut size={18} /></button>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="flex-1 p-4 outline-none md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
