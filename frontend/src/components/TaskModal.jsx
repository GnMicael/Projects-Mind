import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from './Modal';
import { describeError } from '../lib/errors';
import { useAuth } from '../context/AuthContext';
import { createOwned, removeOwned, updateOwned } from '../lib/crud';
import { PRIORITY } from '../config/projects';
import { columnsOf, uid } from '../config/tasks';

function Items({ label, items, onChange }) {
  const [text, setText] = useState('');
  const add = () => { if (!text.trim()) return; onChange([...items, { id: uid(), text: text.trim(), done: false }]); setText(''); };
  return (
    <div><p className="label">{label}</p>
      <ul className="space-y-1">{items.map((i) => (
        <li key={i.id} className="flex items-center gap-2">
          <input type="checkbox" className="h-5 w-5 accent-[#22C55E]" checked={i.done} aria-label={i.text} onChange={() => onChange(items.map((x) => (x.id === i.id ? { ...x, done: !x.done } : x)))} />
          <span className={`flex-1 text-sm ${i.done ? 'text-muted line-through' : ''}`}>{i.text}</span>
          <button type="button" aria-label={`Remover ${i.text}`} className="p-2 text-muted hover:text-red-400" onClick={() => onChange(items.filter((x) => x.id !== i.id))}><Trash2 size={15} /></button>
        </li>))}</ul>
      <div className="mt-2 flex gap-2">
        <input className="input" value={text} placeholder="Adicionar item" aria-label={`Novo item em ${label}`} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <button type="button" className="btn-ghost" aria-label="Adicionar" onClick={add}><Plus size={16} /></button>
      </div>
    </div>
  );
}

export default function TaskModal({ task, initial, projects, projectId, status, onSaved, onClose }) {
  const { user } = useAuth();
  const [f, setF] = useState(() => ({
    title: '', description: '', projectId: projectId || projects[0]?.id || '', status: status || 'todo', priority: 'Média',
    startDate: '', dueDate: '', category: '', labels: '', checklist: [], subtasks: [],
    ...(initial || {}),
    ...(task ? { ...task, labels: (task.labels || []).join(', ') } : {}),
  }));
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target ? e.target.value : e }));
  const cols = columnsOf(projects.find((p) => p.id === f.projectId));

  const save = async (e) => {
    e.preventDefault();
    if (f.title.trim().length < 2) return setErr('Informe um título (mínimo 2 letras).');
    if (!f.projectId) return setErr('Escolha um projeto. Crie um projeto antes, se ainda não tiver.');
    if (f.startDate && f.dueDate && f.dueDate < f.startDate) return setErr('O prazo deve ser depois do início.');
    setBusy(true); setErr('');
    const { id, ownerId, createdAt, updatedAt, ...rest } = f;
    const data = { ...rest, title: f.title.trim(), labels: f.labels.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 10), status: cols.some((c) => c.id === f.status) ? f.status : cols[0].id };
    if (task && data.status === task.status) delete data.status;
    try { if (task) await updateOwned('tasks', task.id, data); else await createOwned('tasks', user.uid, data); onSaved?.(); onClose(); }
    catch (e) { console.error(e); setErr(describeError(e)); setBusy(false); }
  };
  const del = async () => {
    if (!window.confirm('Excluir esta tarefa?')) return;
    try { await removeOwned('tasks', task.id); onClose(); } catch { setErr('Não foi possível excluir.'); }
  };

  return (
    <Modal title={task ? 'Editar tarefa' : 'Nova tarefa'} onClose={onClose}>
      <form onSubmit={save} className="space-y-4" noValidate>
        <div><label className="label" htmlFor="tt">Título</label><input id="tt" className="input" value={f.title} onChange={set('title')} autoFocus /></div>
        <div><label className="label" htmlFor="td">Descrição</label><textarea id="td" rows={3} className="input py-2" value={f.description} onChange={set('description')} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="tp">Projeto</label>
            <select id="tp" className="input" value={f.projectId} disabled={!!projectId} onChange={set('projectId')}>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div><label className="label" htmlFor="ts">Status</label>
            <select id="ts" className="input" value={f.status} onChange={set('status')}>{cols.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="label" htmlFor="tpr">Prioridade</label>
            <select id="tpr" className="input" value={f.priority} onChange={set('priority')}>{PRIORITY.map((p) => <option key={p}>{p}</option>)}</select></div>
          <div><label className="label" htmlFor="tc">Categoria</label><input id="tc" className="input" value={f.category} onChange={set('category')} /></div>
          <div><label className="label" htmlFor="tsd">Início</label><input id="tsd" type="date" className="input" value={f.startDate} onChange={set('startDate')} /></div>
          <div><label className="label" htmlFor="tdd">Prazo</label><input id="tdd" type="date" className="input" value={f.dueDate} onChange={set('dueDate')} /></div>
        </div>
        <div><label className="label" htmlFor="tl">Etiquetas (separadas por vírgula)</label><input id="tl" className="input" value={f.labels} onChange={set('labels')} /></div>
        <Items label="Subtarefas" items={f.subtasks} onChange={set('subtasks')} />
        <Items label="Checklist" items={f.checklist} onChange={set('checklist')} />
        {err && <p role="alert" className="err">{err}</p>}
        <div className="flex justify-between gap-3 pt-2">
          {task ? <button type="button" className="btn-ghost hover:!border-red-400" onClick={del}>Excluir</button> : <span />}
          <div className="flex gap-3"><button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn-primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar'}</button></div>
        </div>
      </form>
    </Modal>
  );
}
