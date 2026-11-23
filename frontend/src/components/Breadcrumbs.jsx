import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import useOwned from '../hooks/useOwned';

const SEC = { quadro: 'Quadro', tarefas: 'Tarefas', calendario: 'Calendário', 'linha-do-tempo': 'Linha do tempo', stakeholders: 'Stakeholders', riscos: 'Riscos', metas: 'Metas e marcos', notas: 'Notas', relatorios: 'Relatórios', editar: 'Editar' };

export default function Breadcrumbs({ title }) {
  const { pathname } = useLocation();
  const { items: projects } = useOwned('projects');
  const m = pathname.match(/^\/app\/projetos\/([^/]+)(?:\/([^/]+))?$/);
  if (!m || m[1] === 'novo') return <p className="truncate font-display text-lg font-semibold">{title}</p>;
  const p = projects.find((x) => x.id === m[1]);
  const crumbs = [{ label: 'Meus projetos', to: '/app/projetos', hideOnMobile: true }, { label: p ? `${p.icon ? `${p.icon} ` : ''}${p.name}` : 'Projeto', to: m[2] ? `/app/projetos/${m[1]}` : null }];
  if (m[2]) crumbs.push({ label: SEC[m[2]] || m[2] });
  return (
    <nav aria-label="Você está em" className="min-w-0">
      <ol className="flex items-center gap-1 text-sm">
        {crumbs.map((c, i) => (
          <li key={i} className={`flex min-w-0 items-center gap-1 ${c.hideOnMobile ? 'hidden sm:flex' : ''}`}>
            {i > 0 && <ChevronRight size={14} className={`shrink-0 text-muted ${i === 1 ? 'hidden sm:block' : ''}`} />}
            {c.to ? <Link to={c.to} className="truncate text-muted hover:text-ink">{c.label}</Link> : <span className="truncate font-semibold" aria-current="page">{c.label}</span>}
          </li>))}
      </ol>
    </nav>
  );
}
