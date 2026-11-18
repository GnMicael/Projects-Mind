import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DndContext, MouseSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, ArrowRight, Pencil, Plus, Trash2 } from 'lucide-react';
import TaskModal from '../../components/TaskModal';
import { updateOwned } from '../../lib/crud';
import { updateProject } from '../../lib/projects';
import { columnsOf, uid } from '../../config/tasks';
import { fmtDate, today } from '../../config/projects';

const PRIO = { Baixa: 'bg-line', Média: 'bg-amber', Alta: 'bg-brand', Urgente: 'bg-red-500' };

function Card({ t, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: t.id });
  const subs = [...(t.subtasks || []), ...(t.checklist || [])];
  const late = t.status !== 'done' && t.dueDate && t.dueDate < today();
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} onClick={() => !isDragging && onOpen(t)}
      style={{ transform: CSS.Translate.toString(transform), zIndex: isDragging ? 20 : undefined }}
      className={`cursor-grab rounded border border-line bg-bg p-3 text-left ${isDragging ? 'opacity-80 shadow-lg' : ''}`}>
      <div className="flex items-start gap-2"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${PRIO[t.priority]}`} title={t.priority} /><p className="text-sm font-medium">{t.title}</p></div>
      {(t.dueDate || subs.length > 0 || t.labels?.length > 0) && (
        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
          {t.dueDate && <span className={late ? 'text-red-400' : ''}>{fmtDate(t.dueDate)}</span>}
          {subs.length > 0 && <span>{subs.filter((s) => s.done).length}/{subs.length}</span>}
          {(t.labels || []).map((l) => <span key={l} className="text-amber">#{l}</span>)}
        </p>)}
    </div>
  );
}

function Column({ col, i, total, tasks, onAdd, onOpen, onRename, onMove, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  const btn = 'grid h-8 w-8 place-items-center rounded text-muted hover:bg-bg hover:text-ink disabled:opacity-30';
  return (
    <section ref={setNodeRef} className={`flex w-72 shrink-0 flex-col rounded-lg border bg-surface p-3 ${isOver ? 'border-brand' : 'border-line'}`} aria-label={col.name}>
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{col.name} <span className="font-normal text-muted">{tasks.length}</span></h3>
        <div className="flex">
          <button className={btn} disabled={i === 0} aria-label="Mover coluna para a esquerda" onClick={() => onMove(i, -1)}><ArrowLeft size={14} /></button>
          <button className={btn} disabled={i === total - 1} aria-label="Mover coluna para a direita" onClick={() => onMove(i, 1)}><ArrowRight size={14} /></button>
          <button className={btn} aria-label="Renomear coluna" onClick={() => onRename(col)}><Pencil size={14} /></button>
          <button className={btn} disabled={col.id === 'done' || total < 2} aria-label="Excluir coluna" onClick={() => onDelete(col, tasks.length)}><Trash2 size={14} /></button>
        </div>
      </header>
      <div className="min-h-[60px] flex-1 space-y-2">{tasks.map((t) => <Card key={t.id} t={t} onOpen={onOpen} />)}</div>
      <button className="mt-3 flex min-h-[40px] items-center gap-1 text-sm text-muted hover:text-brand" onClick={() => onAdd(col.id)}><Plus size={15} />Adicionar tarefa</button>
    </section>
  );
}

export default function Board() {
  const { project, tasks, projects } = useOutletContext();
  const [modal, setModal] = useState(null);
  const [err, setErr] = useState('');
  const cols = columnsOf(project);
  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }));

  const run = async (fn) => { setErr(''); try { await fn(); } catch { setErr('Não foi possível salvar a alteração. Tente novamente.'); } };
  const saveCols = (next) => run(() => updateProject(project.id, { columns: next }));
  const onDragEnd = ({ active, over }) => {
    const t = tasks.find((x) => x.id === active.id);
    if (t && over && over.id !== t.status) run(() => updateOwned('tasks', t.id, { status: over.id }));
  };
  const add = () => { const name = window.prompt('Nome da nova coluna'); if (name?.trim()) saveCols([...cols, { id: `c_${uid()}`, name: name.trim().slice(0, 40) }]); };
  const rename = (c) => { const name = window.prompt('Novo nome da coluna', c.name); if (name?.trim()) saveCols(cols.map((x) => (x.id === c.id ? { ...x, name: name.trim().slice(0, 40) } : x))); };
  const move = (i, d) => { const n = [...cols]; [n[i], n[i + d]] = [n[i + d], n[i]]; saveCols(n); };
  const del = (c, count) => count ? setErr('Mova ou exclua as tarefas desta coluna antes de excluí-la.') : window.confirm(`Excluir a coluna "${c.name}"?`) && saveCols(cols.filter((x) => x.id !== c.id));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">Arraste os cartões entre as colunas. No celular, segure o cartão por um instante.</p>
        <button className="btn-ghost shrink-0" onClick={add}><Plus size={16} />Coluna</button>
      </div>
      {err && <p role="alert" className="err mb-3">{err}</p>}
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex items-start gap-4 overflow-x-auto pb-4">
          {cols.map((c, i) => (
            <Column key={c.id} col={c} i={i} total={cols.length} tasks={tasks.filter((t) => (cols.some((x) => x.id === t.status) ? t.status : cols[0].id) === c.id)}
              onAdd={(status) => setModal({ status })} onOpen={(task) => setModal({ task })} onRename={rename} onMove={move} onDelete={del} />
          ))}
        </div>
      </DndContext>
      {modal && <TaskModal task={modal.task} status={modal.status} projectId={project.id} projects={projects} onClose={() => setModal(null)} />}
    </div>
  );
}
