import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus } from 'lucide-react';
import FormModal from '../../components/FormModal';
import useOwned from '../../hooks/useOwned';
import { useAuth } from '../../context/AuthContext';
import { createOwned, removeOwned, updateOwned } from '../../lib/crud';
import { fmtDate } from '../../config/projects';

const GOAL_FIELDS = [
  { key: 'title', label: 'Título', required: true }, { key: 'description', label: 'Descrição', type: 'textarea' },
  { key: 'targetDate', label: 'Data alvo', type: 'date', half: true }, { key: 'progress', label: 'Progresso (%)', type: 'number', min: 0, max: 100, default: 0, half: true },
  { key: 'status', label: 'Status', type: 'select', options: ['Não iniciada', 'Em andamento', 'Concluída', 'Cancelada'], half: true },
  { key: 'successCriteria', label: 'Critérios de sucesso', type: 'textarea' },
];

export default function Goals() {
  const { project, tasks } = useOutletContext();
  const { user } = useAuth();
  const goals = useOwned('goals');
  const miles = useOwned('milestones');
  const [modal, setModal] = useState(null);
  const gs = goals.items.filter((g) => g.projectId === project.id);
  const ms = miles.items.filter((m) => m.projectId === project.id).sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));

  const MILE_FIELDS = [
    { key: 'title', label: 'Título', required: true }, { key: 'description', label: 'Descrição', type: 'textarea' },
    { key: 'date', label: 'Data', type: 'date', half: true }, { key: 'status', label: 'Status', type: 'select', options: ['Pendente', 'Em andamento', 'Concluído'], half: true },
    { key: 'taskIds', label: 'Tarefas ligadas ao marco', type: 'checks', options: tasks.map((t) => ({ value: t.id, label: t.title })) },
  ];
  const cfg = modal && (modal.kind === 'goals' ? { name: 'goals', fields: GOAL_FIELDS, t: 'meta' } : { name: 'milestones', fields: MILE_FIELDS, t: 'marco' });
  const save = (data) => (modal.item ? updateOwned(cfg.name, modal.item.id, data) : createOwned(cfg.name, user.uid, { ...data, projectId: project.id }));
  if (goals.loading || miles.loading) return <p className="text-muted">Carregando…</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-3">
        <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Metas</h3><button className="btn-ghost !min-h-[40px]" onClick={() => setModal({ kind: 'goals' })}><Plus size={16} />Meta</button></div>
        {gs.length === 0 && <p className="text-sm text-muted">Nenhuma meta. Defina resultados que dizem se o projeto deu certo.</p>}
        {gs.map((g) => (
          <button key={g.id} className="card block w-full p-4 text-left hover:border-brand" onClick={() => setModal({ kind: 'goals', item: g })}>
            <p className="font-medium">{g.title}</p><p className="text-xs text-muted">{g.status} · alvo {fmtDate(g.targetDate)}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg"><div className={`h-full ${g.status === 'Concluída' ? 'bg-leaf' : 'bg-amber'}`} style={{ width: `${g.progress || 0}%` }} /></div>
          </button>))}
      </section>
      <section className="space-y-3">
        <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Marcos</h3><button className="btn-ghost !min-h-[40px]" onClick={() => setModal({ kind: 'milestones' })}><Plus size={16} />Marco</button></div>
        {ms.length === 0 && <p className="text-sm text-muted">Nenhum marco. Marque as entregas importantes e ligue tarefas a elas.</p>}
        {ms.map((m) => {
          const linked = tasks.filter((t) => (m.taskIds || []).includes(t.id));
          return (
            <button key={m.id} className="card block w-full p-4 text-left hover:border-brand" onClick={() => setModal({ kind: 'milestones', item: m })}>
              <p className="font-medium">{m.title}</p>
              <p className="text-xs text-muted">{m.status} · {fmtDate(m.date)}{linked.length ? ` · ${linked.filter((t) => t.status === 'done').length}/${linked.length} tarefas concluídas` : ''}</p>
            </button>);
        })}
      </section>
      {modal && <FormModal title={`${modal.item ? 'Editar' : 'Nova'} ${cfg.t}`} fields={cfg.fields} initial={modal.item} onSubmit={save} onDelete={modal.item ? () => removeOwned(cfg.name, modal.item.id) : null} onClose={() => setModal(null)} />}
    </div>
  );
}
