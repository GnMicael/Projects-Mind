import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import useProjects from '../../hooks/useProjects';
import useOwned from '../../hooks/useOwned';

const TABS = [['', 'Visão geral'], ['quadro', 'Quadro'], ['tarefas', 'Tarefas'], ['calendario', 'Calendário'], ['linha-do-tempo', 'Linha do tempo'], ['stakeholders', 'Stakeholders'], ['riscos', 'Riscos'], ['metas', 'Metas e marcos'], ['notas', 'Notas'], ['relatorios', 'Relatórios']];

export default function ProjectLayout() {
  const { id } = useParams();
  const { projects, loading } = useProjects();
  const { items: allTasks } = useOwned('tasks');
  if (loading) return <p className="text-muted">Carregando…</p>;
  const project = projects.find((p) => p.id === id);
  if (!project) return <div className="py-10 text-center"><p className="text-muted">Projeto não encontrado.</p><Link className="btn-ghost mt-4" to="/app/projetos">Voltar aos projetos</Link></div>;
  const tasks = allTasks.filter((t) => t.projectId === id);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4"><h2 className="text-2xl font-extrabold">{project.icon ? `${project.icon} ` : ''}{project.name}</h2></div>
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-line" aria-label="Seções do projeto">
        {TABS.map(([to, label]) => (
          <NavLink key={to} to={to} end className={({ isActive }) => `whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium ${isActive ? 'border-brand text-ink' : 'border-transparent text-muted hover:text-ink'}`}>{label}</NavLink>
        ))}
      </nav>
      <Outlet context={{ project, tasks, projects }} />
    </div>
  );
}
