import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBr from '@fullcalendar/core/locales/pt-br';
import { Plus } from 'lucide-react';
import useProjects from '../hooks/useProjects';
import useOwned from '../hooks/useOwned';
import TaskModal from '../components/TaskModal';
import EventModal from '../components/EventModal';

export default function CalendarView() {
  const ctx = useOutletContext();
  const { projects: all } = useProjects();
  const { items: tasks } = useOwned('tasks');
  const { items: events } = useOwned('events');
  const { items: miles } = useOwned('milestones');
  const scoped = ctx?.project.id;
  const [filter, setFilter] = useState('todos');
  const [modal, setModal] = useState(null);
  const pid = scoped || filter;
  const inScope = (x) => pid === 'todos' || x.projectId === pid;

  const items = [
    ...tasks.filter((t) => t.dueDate && inScope(t)).map((t) => ({ id: `t${t.id}`, title: t.title, start: t.dueDate, allDay: true, color: t.status === 'done' ? '#22C55E' : '#FBBF24', textColor: '#171717', extendedProps: { kind: 'task', ref: t } })),
    ...events.filter(inScope).map((e) => ({ id: `e${e.id}`, title: e.title, start: e.start, end: e.end || undefined, allDay: e.allDay, color: '#F97316', textColor: '#171717', extendedProps: { kind: 'event', ref: e } })),
    ...miles.filter((m) => m.date && inScope(m)).map((m) => ({ id: `m${m.id}`, title: `◆ ${m.title}`, start: m.date, allDay: true, color: '#E5E5E5', textColor: '#171717', extendedProps: { kind: 'milestone' } })),
    ...all.filter((p) => p.endDate && p.status !== 'Arquivado' && (pid === 'todos' || p.id === pid)).map((p) => ({ id: `p${p.id}`, title: `Prazo: ${p.name}`, start: p.endDate, allDay: true, color: '#525252', textColor: '#fff', extendedProps: { kind: 'deadline' } })),
  ];
  const onClick = ({ event }) => { const { kind, ref } = event.extendedProps; if (kind === 'task') setModal({ type: 'task', ref }); if (kind === 'event') setModal({ type: 'event', ref }); };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {!scoped && <select className="input !w-auto" aria-label="Filtrar por projeto" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="todos">Todos os projetos</option>{all.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>}
        <p className="text-xs text-muted">Amarelo: tarefas · Laranja: eventos · Cinza: prazos de projeto · Claro: marcos</p>
        <button className="btn-primary ml-auto" onClick={() => setModal({ type: 'event' })}><Plus size={16} />Novo evento</button>
      </div>
      <div className="card p-3">
        <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} locale={ptBr} initialView="dayGridMonth" height="auto"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={items} eventClick={onClick} dateClick={(i) => setModal({ type: 'event', start: i.dateStr })} dayMaxEvents={3} />
      </div>
      {modal?.type === 'task' && <TaskModal task={modal.ref} projects={all} onClose={() => setModal(null)} />}
      {modal?.type === 'event' && <EventModal event={modal.ref} start={modal.start} projectId={scoped} projects={all} onClose={() => setModal(null)} />}
    </div>
  );
}
