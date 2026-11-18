import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import FormModal from '../components/FormModal';
import TaskModal from '../components/TaskModal';
import useOwned from '../hooks/useOwned';
import useProjects from '../hooks/useProjects';
import { useAuth } from '../context/AuthContext';
import { createOwned, removeOwned, updateOwned } from '../lib/crud';
import { createProject } from '../lib/projects';
import { fmtTs } from '../config/projects';

const STATUS = ['Nova', 'Explorando', 'Planejada', 'Convertida em projeto', 'Arquivada'];
const FIELDS = [
  { key: 'title', label: 'Título', required: true }, { key: 'content', label: 'Conteúdo', type: 'textarea', rows: 5 },
  { key: 'category', label: 'Categoria', half: true }, { key: 'status', label: 'Status', type: 'select', options: STATUS, half: true },
  { key: 'tags', label: 'Tags (separadas por vírgula)' },
];

export default function Brainstorm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, loading, error } = useOwned('ideas');
  const { projects } = useProjects();
  const [modal, setModal] = useState(null);
  const [task, setTask] = useState(null);
  const [filter, setFilter] = useState('ativas');
  const [msg, setMsg] = useState('');
  const list = items.filter((i) => (filter === 'ativas' ? i.status !== 'Arquivada' : filter === 'todas' || i.status === filter))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  const save = (v) => {
    const data = { ...v, tags: v.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 10) };
    return modal.item ? updateOwned('ideas', modal.item.id, data) : createOwned('ideas', user.uid, data);
  };
  const toProject = async (i) => {
    setMsg('');
    try {
      const ref = await createProject(user.uid, { name: i.title.slice(0, 100), description: i.content || '' });
      await updateOwned('ideas', i.id, { status: 'Convertida em projeto', projectId: ref.id });
      navigate(`/app/projetos/${ref.id}`);
    } catch { setMsg('Não foi possível converter a ideia em projeto.'); }
  };
  const toTask = (i) => (projects.length ? setTask(i) : setMsg('Crie um projeto antes de converter a ideia em tarefa.'));

  if (loading) return <p className="text-muted">Carregando…</p>;
  if (error) return <p className="err">{error}</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <select className="input !w-auto" aria-label="Filtrar ideias" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="ativas">Ativas</option><option value="todas">Todas</option>{STATUS.map((s) => <option key={s}>{s}</option>)}</select>
        <button className="btn-primary ml-auto" onClick={() => setModal({})}><Plus size={16} />Nova ideia</button>
      </div>
      {msg && <p role="alert" className="err">{msg}</p>}
      {list.length === 0 ? <p className="py-12 text-center text-muted">{items.length ? 'Nenhuma ideia nesta visão.' : 'Seu banco de ideias está vazio. Anote a primeira antes que ela escape.'}</p> : (
        <div className="grid gap-4 sm:grid-cols-2">{list.map((i) => (
          <article key={i.id} className="card flex flex-col p-4">
            <h3 className="font-semibold">{i.title}</h3>
            <p className="text-xs text-muted">{i.status}{i.category ? ` · ${i.category}` : ''} · {fmtTs(i.createdAt)}</p>
            {i.content && <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm text-muted">{i.content}</p>}
            {i.tags?.length > 0 && <p className="mt-2 text-xs text-amber">{i.tags.map((t) => `#${t}`).join(' ')}</p>}
            <div className="mt-auto flex flex-wrap gap-2 pt-3">
              <button className="btn-ghost !min-h-[36px]" onClick={() => setModal({ item: { ...i, tags: (i.tags || []).join(', ') } })}>Editar</button>
              {i.status !== 'Convertida em projeto' && <><button className="btn-ghost !min-h-[36px]" onClick={() => toTask(i)}>Virar tarefa</button><button className="btn-ghost !min-h-[36px]" onClick={() => toProject(i)}>Virar projeto</button></>}
            </div>
          </article>))}</div>)}
      {modal && <FormModal title={modal.item ? 'Editar ideia' : 'Nova ideia'} fields={FIELDS} initial={modal.item || {}} onSubmit={save} onDelete={modal.item ? () => removeOwned('ideas', modal.item.id) : null} onClose={() => setModal(null)} />}
      {task && <TaskModal initial={{ title: task.title, description: task.content || '' }} projects={projects} onSaved={() => updateOwned('ideas', task.id, { status: 'Planejada' })} onClose={() => setTask(null)} />}
    </div>
  );
}
