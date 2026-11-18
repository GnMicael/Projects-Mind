import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useOwned from '../hooks/useOwned';
import useProjects from '../hooks/useProjects';
import { ACTIVE, addDays, fmtDate, today } from '../config/projects';

export default function NotificationBell() {
  const { profile } = useAuth();
  const { items: tasks } = useOwned('tasks');
  const { projects } = useProjects();
  const [open, setOpen] = useState(false);
  const n = profile?.prefs?.notifications || {};
  const t0 = today(); const soon = addDays(2); const week = addDays(7);
  const list = [];

  if (n.upcoming !== false) tasks.filter((t) => t.status !== 'done' && t.dueDate && t.dueDate <= soon)
    .forEach((t) => list.push({ id: `t${t.id}`, late: t.dueDate < t0, text: `${t.dueDate < t0 ? 'Atrasada' : 'Vence em breve'}: ${t.title}`, date: t.dueDate, to: `/app/projetos/${t.projectId}/tarefas` }));
  if (n.deadlines !== false) projects.filter((p) => ACTIVE.includes(p.status) && p.endDate && p.endDate <= week)
    .forEach((p) => list.push({ id: `p${p.id}`, late: p.endDate < t0, text: `Prazo do projeto: ${p.name}`, date: p.endDate, to: `/app/projetos/${p.id}` }));
  list.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="relative">
      <button className="relative grid h-10 w-10 place-items-center text-muted hover:text-ink" aria-label={`Notificações${list.length ? `: ${list.length}` : ''}`} aria-expanded={open} onClick={() => setOpen(!open)}>
        <Bell size={18} />{list.length > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-[#171717]">{list.length}</span>}
      </button>
      {open && <>
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        <div className="absolute right-0 z-50 mt-2 max-h-80 w-80 max-w-[85vw] overflow-y-auto rounded-lg border border-line bg-surface p-2 shadow-lg">
          {list.length === 0 ? <p className="p-3 text-sm text-muted">Nada urgente por enquanto.</p> : list.map((x) => (
            <Link key={x.id} to={x.to} onClick={() => setOpen(false)} className="block rounded p-3 text-sm hover:bg-bg"><span className={x.late ? 'text-red-400' : ''}>{x.text}</span><span className="block text-xs text-muted">{fmtDate(x.date)}</span></Link>))}
        </div></>}
    </div>
  );
}
