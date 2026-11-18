import { Link, useOutletContext } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { fmtDate, today } from '../../config/projects';
import { columnsOf } from '../../config/tasks';

export default function Overview() {
  const { project: p, tasks } = useOutletContext();
  const done = tasks.filter((t) => t.status === 'done').length;
  const late = tasks.filter((t) => t.status !== 'done' && t.dueDate && t.dueDate < today()).length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : p.progress || 0;
  const cols = columnsOf(p);
  const Info = ({ l, v }) => v ? <div><p className="text-sm font-semibold">{l}</p><p className="whitespace-pre-line text-sm text-muted">{v}</p></div> : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        {[['Status', p.status], ['Prioridade', p.priority], ['Prazo', fmtDate(p.endDate)], ['Progresso', `${progress}%`]].map(([l, v]) => <div key={l} className="card p-4"><p className="text-sm text-muted">{l}</p><p className="font-display text-xl font-extrabold">{v}</p></div>)}
      </div>
      <div className="card p-5">
        <div className="h-2 overflow-hidden rounded-full bg-bg"><div className="h-full bg-amber" style={{ width: `${progress}%` }} /></div>
        <p className="mt-2 text-sm text-muted">{tasks.length ? `${done} de ${tasks.length} tarefas concluídas${late ? ` · ${late} atrasada(s)` : ''}` : 'Sem tarefas ainda: o progresso mostrado é o informado no cadastro.'}</p>
        <ul className="mt-4 flex flex-wrap gap-4 text-sm">{cols.map((c) => <li key={c.id}><span className="text-muted">{c.name}: </span>{tasks.filter((t) => t.status === c.id).length}</li>)}</ul>
      </div>
      <div className="card space-y-4 p-5">
        <div className="flex items-center justify-between"><h3 className="font-semibold">Detalhes</h3><Link to={`/app/projetos/${p.id}/editar`} className="btn-ghost !min-h-[36px]"><Pencil size={14} />Editar</Link></div>
        <Info l="Descrição" v={p.description} /><Info l="Objetivo principal" v={p.mainObjective} /><Info l="Resultados esperados" v={p.expectedResults} />
        <Info l="Critérios de sucesso" v={p.successCriteria} /><Info l="Escopo" v={p.scope} /><Info l="Marcos" v={p.milestones} /><Info l="Riscos iniciais" v={p.risks} />
        {!p.description && !p.mainObjective && <p className="text-sm text-muted">Nenhum detalhe preenchido. Use Editar para completar o projeto quando quiser.</p>}
      </div>
    </div>
  );
}
