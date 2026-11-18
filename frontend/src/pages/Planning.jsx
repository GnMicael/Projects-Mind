import { Link } from 'react-router-dom';
import { Network, ShieldAlert, Target, FileText, BarChart3 } from 'lucide-react';
import useProjects from '../hooks/useProjects';

const TOOLS = [['stakeholders', 'Stakeholders', Network], ['riscos', 'Riscos', ShieldAlert], ['metas', 'Metas e marcos', Target], ['notas', 'Notas', FileText], ['relatorios', 'Relatórios', BarChart3]];

export default function Planning() {
  const { projects, loading } = useProjects();
  const list = projects.filter((p) => p.status !== 'Arquivado');
  if (loading) return <p className="text-muted">Carregando…</p>;
  if (!list.length) return <div className="py-16 text-center"><p className="text-muted">As ferramentas de planejamento ficam dentro de cada projeto. Crie um projeto para começar.</p><Link className="btn-primary mt-4" to="/app/projetos/novo">Criar projeto</Link></div>;
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <p className="text-sm text-muted">Escolha um projeto e a ferramenta de planejamento que quer abrir.</p>
      {list.map((p) => (
        <section key={p.id} className="card p-4"><h3 className="font-semibold">{p.name}</h3>
          <div className="mt-3 flex flex-wrap gap-2">{TOOLS.map(([to, label, Icon]) => <Link key={to} className="btn-ghost !min-h-[40px]" to={`/app/projetos/${p.id}/${to}`}><Icon size={15} />{label}</Link>)}</div></section>))}
    </div>
  );
}
