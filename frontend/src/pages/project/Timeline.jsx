import { useOutletContext } from 'react-router-dom';
import { fmtDate, today } from '../../config/projects';

const DAY = 86400000;
const ms = (s) => new Date(`${s}T00:00`).getTime();

export default function Timeline() {
  const { tasks } = useOutletContext();
  const items = tasks.filter((t) => t.startDate || t.dueDate).map((t) => ({ ...t, s: t.startDate || t.dueDate, e: t.dueDate || t.startDate })).sort((a, b) => a.s.localeCompare(b.s));
  if (!items.length) return <p className="py-12 text-center text-muted">Defina início e prazo nas tarefas para vê-las aqui.</p>;

  const min = Math.min(...items.map((i) => ms(i.s)));
  const max = Math.max(...items.map((i) => ms(i.e)));
  const span = Math.max(max - min + DAY, 7 * DAY);
  const pct = (v) => ((v - min) / span) * 100;
  const t0 = ms(today());

  return (
    <div className="card overflow-x-auto p-4">
      <div className="min-w-[640px]">
        <div className="mb-2 flex justify-between pl-40 text-xs text-muted"><span>{fmtDate(items[0].s)}</span><span>{fmtDate(new Date(max).toISOString().slice(0, 10))}</span></div>
        <div className="relative">
          {t0 >= min && t0 <= min + span && <div className="pointer-events-none absolute bottom-0 top-0 w-px bg-amber" style={{ left: `calc(10rem + (100% - 10rem) * ${pct(t0) / 100})` }} title="Hoje" />}
          {items.map((i) => (
            <div key={i.id} className="flex items-center border-t border-line">
              <p className="w-40 shrink-0 truncate pr-3 text-sm" title={i.title}>{i.title}</p>
              <div className="relative h-10 flex-1">
                <div className={`absolute top-2.5 h-5 rounded ${i.status === 'done' ? 'bg-leaf' : 'bg-brand'}`}
                  style={{ left: `${pct(ms(i.s))}%`, width: `${Math.max(((ms(i.e) - ms(i.s) + DAY) / span) * 100, 1.5)}%` }}
                  title={`${fmtDate(i.s)} → ${fmtDate(i.e)}`} />
              </div>
            </div>))}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">Linha amarela: hoje. Dependências entre tarefas e fases chegam em uma próxima versão.</p>
    </div>
  );
}
