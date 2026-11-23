import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, CheckSquare, FolderPlus, Lightbulb, Plus } from 'lucide-react';
import useProjects from '../hooks/useProjects';
import TaskModal from './TaskModal';
import EventModal from './EventModal';

export default function QuickCreate() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const list = projects.filter((p) => p.status !== 'Arquivado');
  const items = [
    ['Novo projeto', FolderPlus, () => navigate('/app/projetos/novo')],
    ['Nova tarefa', CheckSquare, () => setModal('task')],
    ['Novo evento', CalendarPlus, () => setModal('event')],
    ['Nova ideia', Lightbulb, () => navigate('/app/brainstorm', { state: { new: true } })],
  ];
  return (
    <div className="relative">
      <button className="btn-primary !min-h-[36px] !px-3" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}><Plus size={16} /><span className="hidden sm:inline">Novo</span></button>
      {open && <>
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        <div role="menu" className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-line bg-surface p-2 shadow-lg">
          {items.map(([label, Icon, fn]) => <button key={label} role="menuitem" className="flex min-h-[44px] w-full items-center gap-3 rounded px-3 text-left text-sm hover:bg-bg" onClick={() => { setOpen(false); fn(); }}><Icon size={16} className="text-brand" />{label}</button>)}
        </div></>}
      {modal === 'task' && <TaskModal projects={list} onClose={() => setModal(null)} />}
      {modal === 'event' && <EventModal projects={list} onClose={() => setModal(null)} />}
    </div>
  );
}
