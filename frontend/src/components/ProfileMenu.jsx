import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, LogOut, Settings, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePwaInstall } from '../lib/pwa';

export default function ProfileMenu() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const pwa = usePwaInstall();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open]);
  const name = profile?.name || user?.displayName || '';
  const item = 'flex min-h-[44px] w-full items-center gap-3 rounded px-3 text-left text-sm hover:bg-bg';

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open} aria-label="Menu do perfil" className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-amber text-sm font-bold text-[#171717]">
        {user?.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-9 w-9 object-cover" /> : (name || user?.email || '?')[0].toUpperCase()}
      </button>
      {open && <>
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-line bg-surface p-2 shadow-lg">
          <div className="border-b border-line px-3 pb-2"><p className="truncate text-sm font-semibold">{name || 'Minha conta'}</p><p className="truncate text-xs text-muted">{user?.email}</p></div>
          <div className="pt-2" onClick={() => setOpen(false)}>
            <Link role="menuitem" to="/app/configuracoes" className={item}><Settings size={16} />Configurações</Link>
            <Link role="menuitem" to="/app/configuracoes/personalizar" className={item}><SlidersHorizontal size={16} />Refazer perguntas iniciais</Link>
          </div>
          {pwa.available && !pwa.installed && <button role="menuitem" className={item} onClick={() => { setOpen(false); pwa.prompt(); }}><Download size={16} />Instalar app</button>}
          <button role="menuitem" className={`${item} text-red-400`} onClick={async () => { setOpen(false); await logout(); navigate('/'); }}><LogOut size={16} />Sair</button>
        </div></>}
    </div>
  );
}
