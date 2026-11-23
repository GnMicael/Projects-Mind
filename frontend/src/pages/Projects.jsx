import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Archive, Copy, LayoutGrid, List, Pencil, Search, Star, Trash2, FolderPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useProjects from '../hooks/useProjects';
import useOwned from '../hooks/useOwned';
import { deleteProject, duplicateProject, updateProject } from '../lib/projects';
import { PRIORITY, STATUS, fmtDate, fmtTs } from '../config/projects';

const PRIO_COLOR = { Baixa: 'text-muted', Média: 'text-amber', Alta: 'text-brand', Urgente: 'text-red-400' };
const SORTS = { updated: 'Atualização', deadline: 'Prazo', name: 'Nome', priority: 'Prioridade' };

export default function Projects() {
  const { user } = useAuth();
  const { projects, loading, error } = useProjects();
  const { items: tasks } = useOwned('tasks');
  const prog = (p) => { const ts = tasks.filter((t) => t.projectId === p.id); return ts.length ? Math.round((ts.filter((t) => t.status === 'done').length / ts.length) * 100) : p.progress || 0; };
  const navigate = useNavigate();
  const [view, setView] = useState('grid');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('ativos');
  const [prio, setPrio] = useState('todas');
  const [favOnly, setFavOnly] = useState(false);
  const [sort, setSort] = useState('updated');
  const [msg, setMsg] = useState('');

  const list = useMemo(() => {
    let l = projects.filter((p) => (status === 'ativos' ? p.status !== 'Arquivado' : status === 'todos' ? true : p.status === status));
    if (prio !== 'todas') l = l.filter((p) => p.priority === prio);
    if (favOnly) l = l.filter((p) => p.favorite);
    if (q.trim()) { const s = q.toLowerCase(); l = l.filter((p) => [p.name, p.description, p.category, ...(p.tags || [])].join(' ').toLowerCase().includes(s)); }
    const cmp = {
      updated: (a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0),
      deadline: (a, b) => (a.endDate || '9999').localeCompare(b.endDate || '9999'),
      name: (a, b) => a.name.localeCompare(b.name),
      priority: (a, b) => PRIORITY.indexOf(b.priority) - PRIORITY.indexOf(a.priority),
    }[sort];
    return [...l].sort(cmp);
  }, [projects, q, status, prio, favOnly, sort]);

  const act = async (fn, ok) => { setMsg(''); try { await fn(); setMsg(ok); } catch { setMsg('Não foi possível concluir a ação. Tente novamente.'); } };
  const actions = (p) => [
    [Star, p.favorite ? 'Remover dos favoritos' : 'Favoritar', () => act(() => updateProject(p.id, { favorite: !p.favorite }), ''), p.favorite ? 'text-amber' : ''],
    [Pencil, 'Editar', () => navigate(`/app/projetos/${p.id}/editar`)],
    [Copy, 'Duplicar', () => act(() => duplicateProject(user.uid, p, tasks.filter((t) => t.projectId === p.id)), 'Projeto duplicado.')],
    [Archive, p.status === 'Arquivado' ? 'Desarquivar' : 'Arquivar', () => act(() => updateProject(p.id, { status: p.status === 'Arquivado' ? 'Planejamento' : 'Arquivado' }), p.status === 'Arquivado' ? 'Projeto desarquivado.' : 'Projeto arquivado.')],
    [Trash2, 'Excluir', () => window.confirm(`Excluir "${p.name}"? Esta ação não pode ser desfeita.`) && act(() => deleteProject(user.uid, p.id), 'Projeto excluído.'), 'hover:text-red-400'],
  ].map(([Icon, label, fn, cls = '']) => (
    <button key={label} onClick={fn} title={label} aria-label={label} className={`grid h-10 w-10 place-items-center rounded text-muted hover:bg-bg hover:text-ink ${cls}`}><Icon size={17} fill={label.includes('favoritos') ? 'currentColor' : 'none'} /></button>
  ));

  const Card = ({ p }) => (
    <article className={`card p-4 ${view === 'list' ? 'flex flex-wrap items-center gap-4' : 'flex flex-col'}`}>
      <div className={view === 'list' ? 'min-w-[200px] flex-1' : ''}>
        <div className="flex items-start justify-between gap-2"><h3 className="font-semibold"><Link className="hover:text-brand" to={`/app/projetos/${p.id}`}>{p.icon ? `${p.icon} ` : ''}{p.name}</Link></h3><span className={`text-xs font-semibold ${PRIO_COLOR[p.priority]}`}>{p.priority}</span></div>
        {p.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{p.description}</p>}
        <p className="mt-2 text-xs text-muted">{p.status}{p.category ? ` · ${p.category}` : ''} · Prazo {fmtDate(p.endDate)} · Atualizado {fmtTs(p.updatedAt)}</p>
      </div>
      <div className={view === 'list' ? 'w-40' : 'mt-3'}>
        <div className="h-2 overflow-hidden rounded-full bg-bg" role="progressbar" aria-valuenow={prog(p)} aria-valuemin={0} aria-valuemax={100}>
          <div className={`h-full ${p.status === 'Concluído' ? 'bg-leaf' : 'bg-amber'}`} style={{ width: `${prog(p)}%` }} />
        </div><p className="mt-1 text-xs text-muted">{prog(p)}%</p>
      </div>
      <div className={`flex ${view === 'list' ? '' : 'mt-auto pt-2'}`}>{actions(p)}</div>
    </article>
  );

  if (loading) return <p className="text-muted">Carregando…</p>;
  if (error) return <p className="err">{error}</p>;
  if (!projects.length) return (
    <div className="mx-auto max-w-md py-16 text-center">
      <FolderPlus className="mx-auto text-brand" /><h2 className="mt-4 text-2xl font-extrabold">Nenhum projeto ainda</h2>
      <p className="mt-2 text-muted">Crie o primeiro só com um nome. O resto você completa depois.</p>
      <Link to="/app/projetos/novo" className="btn-primary mt-6">Criar projeto</Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1"><Search size={16} className="absolute left-3 top-3.5 text-muted" />
          <input className="input !pl-9" placeholder="Buscar por nome, tag ou categoria" aria-label="Buscar projetos" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className="input !w-auto" aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ativos">Ativos</option><option value="todos">Todos</option>{STATUS.map((s) => <option key={s}>{s}</option>)}</select>
        <select className="input !w-auto" aria-label="Prioridade" value={prio} onChange={(e) => setPrio(e.target.value)}>
          <option value="todas">Toda prioridade</option>{PRIORITY.map((s) => <option key={s}>{s}</option>)}</select>
        <select className="input !w-auto" aria-label="Ordenar por" value={sort} onChange={(e) => setSort(e.target.value)}>
          {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>Ordenar: {v}</option>)}</select>
        <button className={`btn ${favOnly ? 'bg-amber text-[#171717]' : 'border border-line'}`} aria-pressed={favOnly} onClick={() => setFavOnly(!favOnly)}><Star size={16} />Favoritos</button>
        <div className="flex">
          {[['grid', LayoutGrid, 'Grade'], ['list', List, 'Lista']].map(([v, Icon, l]) => (
            <button key={v} aria-label={l} aria-pressed={view === v} onClick={() => setView(v)} className={`grid h-11 w-11 place-items-center border border-line first:rounded-l last:rounded-r ${view === v ? 'bg-brand text-[#171717]' : 'text-muted'}`}><Icon size={17} /></button>))}
        </div>
      </div>
      {msg && <p role="status" className="text-sm text-leaf">{msg}</p>}
      {list.length === 0 ? <p className="py-10 text-center text-muted">Nenhum projeto com esses filtros.</p>
        : <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>{list.map((p) => <Card key={p.id} p={p} />)}</div>}
    </div>
  );
}
