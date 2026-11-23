import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, FolderPlus, Lightbulb, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useProjects from '../hooks/useProjects';
import useOwned from '../hooks/useOwned';
import { recommend } from '../config/onboarding';
import { ACTIVE, fmtDate, fmtTs, today } from '../config/projects';

function List({ title, items, href, right }) {
  return (
    <section className="card p-5"><h3 className="mb-3 font-semibold">{title}</h3>
      {items.length === 0 ? <p className="text-sm text-muted">Nada por aqui ainda.</p> :
        <ul className="space-y-2">{items.map((p) => <li key={p.id} className="flex justify-between gap-3 text-sm"><Link className="truncate hover:text-brand" to={href(p)}>{p.name || p.title}</Link><span className="shrink-0 text-muted">{right(p)}</span></li>)}</ul>}
    </section>
  );
}

export default function Dashboard() {
  const { profile, user } = useAuth();
  const { projects, loading } = useProjects();
  const { items: tasks } = useOwned('tasks');
  const { items: events } = useOwned('events');
  const first = (profile?.name || user?.displayName || '').split(' ')[0];
  const date = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const recs = recommend(profile);
  const t0 = today();

  const active = projects.filter((p) => ACTIVE.includes(p.status));
  const done = projects.filter((p) => p.status === 'Concluído');
  const upcoming = active.filter((p) => p.endDate && p.endDate >= t0).sort((a, b) => a.endDate.localeCompare(b.endDate)).slice(0, 4);
  const favs = projects.filter((p) => p.favorite && p.status !== 'Arquivado').slice(0, 4);
  const recent = [...projects].sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)).slice(0, 5);
  const nextEvents = events.filter((e) => String(e.start).slice(0, 10) >= t0).sort((a, b) => String(a.start).localeCompare(String(b.start))).slice(0, 4);
  const open = tasks.filter((t) => t.status !== 'done');
  const lateTasks = open.filter((t) => t.dueDate && t.dueDate < t0);
  const stats = [['Projetos ativos', active.length], ['Concluídos', done.length], ['Tarefas pendentes', open.length], ['Tarefas atrasadas', lateTasks.length]];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div><p className="text-sm capitalize text-muted">{date}</p><h2 className="text-3xl font-extrabold">Olá, {first}.</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/app/projetos/novo" className="btn-primary"><FolderPlus size={16} />Novo projeto</Link>
          <Link to="/app/brainstorm" state={{ new: true }} className="btn-ghost"><Lightbulb size={16} />Anotar ideia</Link>
          <Link to="/app/calendario" className="btn-ghost"><CalendarDays size={16} />Ver calendário</Link>
        </div>
      </div>

      {!loading && projects.length === 0 ? (
        <section className="card flex flex-col items-start gap-3 p-6">
          <FolderPlus className="text-brand" /><h3 className="text-lg font-semibold">Você ainda não tem projetos</h3>
          <p className="max-w-md text-sm text-muted">Comece só com um nome. Objetivos, prazos e riscos podem ser preenchidos depois.</p>
          <Link to="/app/projetos/novo" className="btn-primary">Criar primeiro projeto</Link>
        </section>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(([l, n]) => <div key={l} className="card p-5"><p className="font-display text-4xl font-extrabold">{loading ? '–' : n}</p><p className="text-sm text-muted">{l}</p></div>)}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <List title="Próximos prazos" items={upcoming} href={(p) => `/app/projetos/${p.id}`} right={(p) => fmtDate(p.endDate)} />
            <List title="Próximos eventos" items={nextEvents} href={() => '/app/calendario'} right={(e) => fmtDate(String(e.start).slice(0, 10))} />
            <List title="Atividade recente" items={recent} href={(p) => `/app/projetos/${p.id}`} right={(p) => fmtTs(p.updatedAt)} />
            {favs.length > 0 && <List title="Favoritos" items={favs} href={(p) => `/app/projetos/${p.id}`} right={() => <Star size={14} className="text-amber" fill="currentColor" />} />}
          </div>
        </>
      )}

      <section>
        <h3 className="text-lg font-semibold">Sugestões para o seu jeito de trabalhar</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {recs.map((r) => (
            <Link key={r.id} to={r.to} className="card group flex items-center justify-between p-4 hover:border-brand">
              <div><p className="font-semibold">{r.label}</p><p className="text-sm text-muted">{r.why}</p></div>
              <ArrowRight size={18} className="text-muted group-hover:text-brand" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
