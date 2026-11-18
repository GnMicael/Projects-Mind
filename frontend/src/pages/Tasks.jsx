import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus } from 'lucide-react';
import useProjects from '../hooks/useProjects';
import useOwned from '../hooks/useOwned';
import TaskModal from '../components/TaskModal';
import { updateOwned } from '../lib/crud';
import { PRIORITY, fmtDate, today } from '../config/projects';
import { columnsOf } from '../config/tasks';

const TABS = [['todas', 'Todas'], ['hoje', 'Hoje'], ['proximas', 'Próximas'], ['atrasadas', 'Atrasadas'], ['concluidas', 'Concluídas']];

export default function Tasks() {
  const ctx = useOutletContext(); // definido apenas dentro de um projeto
  const { projects: all } = useProjects();
  const { items: allTasks, loading, error } = useOwned('tasks');
  const projects = ctx?.projects || all;
  const base = ctx ? ctx.tasks : allTasks;
  const [tab, setTab] = useState('todas');
  const [pf, setPf] = useState('todos');
  const [prio, setPrio] = useState('todas');
  const [cat, setCat] = useState('todas');
  const [modal, setModal] = useState(null);
  const [err, setErr] = useState('');
  const t0 = today();

  const cats = useMemo(() => [...new Set(base.map((t) => t.category).filter(Boolean))], [base]);
  const list = base.filter((t) => {
    const done = t.status === 'done';
    if (tab === 'hoje' && !(t.dueDate === t0 && !done)) return false;
    if (tab === 'proximas' && !(t.dueDate > t0 && !done)) return false;
    if (tab === 'atrasadas' && !(t.dueDate && t.dueDate < t0 && !done)) return false;
    if (tab === 'concluidas' && !done) return false;
    if (pf !== 'todos' && t.projectId !== pf) return false;
    if (prio !== 'todas' && t.priority !== prio) return false;
    if (cat !== 'todas' && t.category !== cat) return false;
    return true;
  }).sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));

  const toggle = async (t) => {
    const proj = projects.find((p) => p.id === t.projectId);
    setErr('');
    try { await updateOwned('tasks', t.id, { status: t.status === 'done' ? columnsOf(proj)[0].id : 'done' }); } catch { setErr('Não foi possível atualizar a tarefa.'); }
  };
  const name = (id) => projects.find((p) => p.id === id)?.name || '—';

  if (loading) return <p className="text-muted">Carregando…</p>;
  if (error) return <p className="err">{error}</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 overflow-x-auto">{TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} aria-pressed={tab === k} className={`btn whitespace-nowrap ${tab === k ? 'bg-brand text-[#171717]' : 'border border-line text-muted'}`}>{l}</button>))}</div>
        <button className="btn-primary" onClick={() => setModal({})}><Plus size={16} />Nova tarefa</button>
      </div>
      <div className="flex flex-wrap gap-3">
        {!ctx && <select className="input !w-auto" aria-label="Projeto" value={pf} onChange={(e) => setPf(e.target.value)}><option value="todos">Todos os projetos</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>}
        <select className="input !w-auto" aria-label="Prioridade" value={prio} onChange={(e) => setPrio(e.target.value)}><option value="todas">Toda prioridade</option>{PRIORITY.map((p) => <option key={p}>{p}</option>)}</select>
        {cats.length > 0 && <select className="input !w-auto" aria-label="Categoria" value={cat} onChange={(e) => setCat(e.target.value)}><option value="todas">Toda categoria</option>{cats.map((c) => <option key={c}>{c}</option>)}</select>}
      </div>
      {err && <p role="alert" className="err">{err}</p>}
      {list.length === 0 ? (
        <p className="py-12 text-center text-muted">{base.length === 0 ? 'Nenhuma tarefa ainda. Crie a primeira para começar.' : 'Nenhuma tarefa nesta visão.'}</p>
      ) : (
        <ul className="card divide-y divide-line">{list.map((t) => {
          const done = t.status === 'done'; const late = !done && t.dueDate && t.dueDate < t0;
          return (
            <li key={t.id} className="flex items-center gap-3 px-4 py-2">
              <input type="checkbox" className="h-5 w-5 shrink-0 accent-[#22C55E]" checked={done} onChange={() => toggle(t)} aria-label={`Concluir ${t.title}`} />
              <button className="min-h-[44px] flex-1 text-left" onClick={() => setModal({ task: t })}>
                <span className={`block text-sm font-medium ${done ? 'text-muted line-through' : ''}`}>{t.title}</span>
                <span className="text-xs text-muted">{ctx ? '' : `${name(t.projectId)} · `}{t.priority}{t.category ? ` · ${t.category}` : ''}</span>
              </button>
              <span className={`text-xs ${late ? 'text-red-400' : 'text-muted'}`}>{fmtDate(t.dueDate)}</span>
            </li>);
        })}</ul>
      )}
      {modal && <TaskModal task={modal.task} projectId={ctx?.project.id} projects={projects} onClose={() => setModal(null)} />}
    </div>
  );
}
