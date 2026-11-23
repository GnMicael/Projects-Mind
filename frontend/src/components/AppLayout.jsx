import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, PlusCircle, CheckSquare, CalendarDays, Network, Lightbulb, LayoutTemplate, Settings, Menu, X, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import NotificationBell from './NotificationBell';
import Breadcrumbs from './Breadcrumbs';
import ProfileMenu from './ProfileMenu';
import QuickCreate from './QuickCreate';
import SearchDialog from './SearchDialog';
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
  const { profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const { pathname } = useLocation();
  const current = [...NAV].reverse().find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))?.label || (pathname.startsWith('/app/projetos') ? 'Meus projetos' : '');

  useEffect(() => {
    const p = profile?.prefs; if (!p) return;
    if (p.theme) applyTheme(p.theme); if (p.accent) applyAccent(p.accent); if (p.dateFormat) setDateFormat(p.dateFormat);
  }, [profile?.prefs]);

  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearching(true); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

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
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-bg px-3 sm:px-4">
          <button className="grid h-10 w-10 place-items-center md:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu size={22} /></button>
          <div className="min-w-0 flex-1"><Breadcrumbs title={current} /></div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button onClick={() => setSearching(true)} className="hidden min-h-[36px] items-center gap-2 rounded border border-line px-3 text-sm text-muted hover:border-brand sm:flex" aria-label="Buscar"><Search size={15} />Buscar<kbd className="ml-3 rounded border border-line px-1 text-xs">Ctrl K</kbd></button>
            <button onClick={() => setSearching(true)} className="grid h-10 w-10 place-items-center text-muted hover:text-ink sm:hidden" aria-label="Buscar"><Search size={18} /></button>
            <QuickCreate />
            <NotificationBell />
            <ProfileMenu />
          </div>
        </header>
        <main id="main" tabIndex={-1} className="flex-1 p-4 outline-none md:p-8"><Outlet /></main>
      </div>
      {searching && <SearchDialog onClose={() => setSearching(false)} />}
    </div>
  );
}
