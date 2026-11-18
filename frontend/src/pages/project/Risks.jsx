import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus } from 'lucide-react';
import FormModal from '../../components/FormModal';
import useOwned from '../../hooks/useOwned';
import { useAuth } from '../../context/AuthContext';
import { createOwned, removeOwned, updateOwned } from '../../lib/crud';
import { fmtDate, today } from '../../config/projects';

import { LEVELS, LEVEL_COLOR, levelOf } from '../../config/risks';
const scale = (names) => names.map((l, i) => ({ value: String(i + 1), label: `${i + 1} – ${l}` }));
const STATUS = ['Identificado', 'Em mitigação', 'Mitigado', 'Ocorreu', 'Encerrado'];
const FIELDS = [
  { key: 'name', label: 'Nome do risco', required: true }, { key: 'description', label: 'Descrição', type: 'textarea' },
  { key: 'probability', label: 'Probabilidade', type: 'select', numeric: true, default: '3', half: true, options: scale(['Muito baixa', 'Baixa', 'Média', 'Alta', 'Muito alta']) },
  { key: 'impact', label: 'Impacto', type: 'select', numeric: true, default: '3', half: true, options: scale(['Mínimo', 'Pequeno', 'Moderado', 'Grande', 'Severo']) },
  { key: 'strategy', label: 'Estratégia de resposta', type: 'select', options: ['Mitigar', 'Evitar', 'Transferir', 'Aceitar'], half: true },
  { key: 'status', label: 'Status', type: 'select', options: STATUS, half: true },
  { key: 'mitigation', label: 'Plano de mitigação', type: 'textarea' },
  { key: 'responsible', label: 'Responsável', half: true }, { key: 'dateIdentified', label: 'Data de identificação', type: 'date', half: true, default: today() },
];

export default function Risks() {
  const { project } = useOutletContext();
  const { user } = useAuth();
  const { items, loading } = useOwned('risks');
  const [modal, setModal] = useState(null);
  const [lf, setLf] = useState('todos');
  const [sf, setSf] = useState('todos');
  const risks = items.filter((r) => r.projectId === project.id);
  const list = risks.filter((r) => (lf === 'todos' || r.level === lf) && (sf === 'todos' || r.status === sf)).sort((a, b) => b.severity - a.severity);

  const save = (v) => {
    const data = { ...v, severity: v.probability * v.impact, level: levelOf(v.probability, v.impact) };
    return modal.item ? updateOwned('risks', modal.item.id, data) : createOwned('risks', user.uid, { ...data, projectId: project.id });
  };
  const Badge = ({ level }) => <span className="rounded px-2 py-0.5 text-xs font-semibold text-[#171717]" style={{ background: LEVEL_COLOR[level] }}>{level}</span>;
  if (loading) return <p className="text-muted">Carregando…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <select className="input !w-auto" aria-label="Nível" value={lf} onChange={(e) => setLf(e.target.value)}><option value="todos">Todos os níveis</option>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select>
        <select className="input !w-auto" aria-label="Status" value={sf} onChange={(e) => setSf(e.target.value)}><option value="todos">Todos os status</option>{STATUS.map((l) => <option key={l}>{l}</option>)}</select>
        <button className="btn-primary ml-auto" onClick={() => setModal({})}><Plus size={16} />Risco</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="card p-4" aria-label="Matriz de riscos">
          <h3 className="mb-3 font-semibold">Matriz de riscos</h3>
          <div className="grid grid-cols-[auto_repeat(5,1fr)] gap-1 text-center text-xs">
            {[5, 4, 3, 2, 1].map((imp) => (
              <div key={imp} className="contents">
                <span className="self-center pr-1 text-muted">{imp}</span>
                {[1, 2, 3, 4, 5].map((pr) => {
                  const n = risks.filter((r) => r.probability === pr && r.impact === imp).length;
                  return <div key={pr} className="grid aspect-square place-items-center rounded font-semibold" style={{ background: `${LEVEL_COLOR[levelOf(pr, imp)]}38` }} title={`Probabilidade ${pr}, impacto ${imp}`}>{n || ''}</div>;
                })}
              </div>))}
            <span /><span className="col-span-5 pt-1 text-muted">Probabilidade →  (linhas: impacto)</span>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-1 text-xs">{LEVELS.map((l) => <li key={l} className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: LEVEL_COLOR[l] }} />{l}: {risks.filter((r) => r.level === l).length}</li>)}</ul>
        </section>

        <section>
          {risks.length === 0 ? <p className="text-sm text-muted">Nenhum risco registrado. Liste o que pode dar errado e como você pretende reagir.</p>
            : list.length === 0 ? <p className="text-sm text-muted">Nenhum risco com esses filtros.</p>
            : <ul className="card divide-y divide-line">{list.map((r) => (
              <li key={r.id}><button className="flex min-h-[56px] w-full flex-wrap items-center gap-3 px-4 py-2 text-left" onClick={() => setModal({ item: r })}>
                <Badge level={r.level} /><span className="min-w-[140px] flex-1 text-sm font-medium">{r.name}</span>
                <span className="text-xs text-muted">{r.probability}×{r.impact}={r.severity} · {r.strategy} · {r.status}{r.responsible ? ` · ${r.responsible}` : ''} · {fmtDate(r.dateIdentified)}</span></button></li>))}</ul>}
        </section>
      </div>
      {modal && <FormModal title={modal.item ? 'Editar risco' : 'Novo risco'} fields={FIELDS} initial={modal.item ? { ...modal.item, probability: String(modal.item.probability), impact: String(modal.item.impact) } : {}} onSubmit={save} onDelete={modal.item ? () => removeOwned('risks', modal.item.id) : null} onClose={() => setModal(null)} />}
    </div>
  );
}
