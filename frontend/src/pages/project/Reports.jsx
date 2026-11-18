import { useOutletContext } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useOwned from '../../hooks/useOwned';
import { columnsOf } from '../../config/tasks';
import { today } from '../../config/projects';
import { LEVELS, LEVEL_COLOR } from '../../config/risks';

const tick = { fill: 'var(--muted)', fontSize: 12 };
const tip = { contentStyle: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)' } };

export default function Reports() {
  const { project, tasks } = useOutletContext();
  const risks = useOwned('risks').items.filter((r) => r.projectId === project.id);
  const miles = useOwned('milestones').items.filter((m) => m.projectId === project.id);
  const done = tasks.filter((t) => t.status === 'done');
  const late = tasks.filter((t) => t.status !== 'done' && t.dueDate && t.dueDate < today());
  const progress = tasks.length ? Math.round((done.length / tasks.length) * 100) : null;
  const byCol = columnsOf(project).map((c) => ({ name: c.name, tarefas: tasks.filter((t) => t.status === c.id).length }));
  const byLevel = LEVELS.map((l) => ({ name: l, riscos: risks.filter((r) => r.level === l).length }));

  const perDay = {};
  done.forEach((t) => { if (t.completedAt?.toDate) { const d = t.completedAt.toDate().toISOString().slice(0, 10); perDay[d] = (perDay[d] || 0) + 1; } });
  let acc = 0;
  const over = Object.keys(perDay).sort().map((d) => ({ dia: d.slice(5).split('-').reverse().join('/'), concluídas: (acc += perDay[d]) }));

  const stats = [['Progresso', progress === null ? '—' : `${progress}%`], ['Tarefas concluídas', done.length], ['Tarefas pendentes', tasks.length - done.length], ['Tarefas atrasadas', late.length],
    ['Marcos concluídos', `${miles.filter((m) => m.status === 'Concluído').length}/${miles.length}`], ['Status do projeto', project.status]];
  const Chart = ({ title, children, empty }) => <section className="card p-4"><h3 className="mb-3 font-semibold">{title}</h3>{empty ? <p className="text-sm text-muted">{empty}</p> : <div className="h-60">{children}</div>}</section>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">{stats.map(([l, v]) => <div key={l} className="card p-4"><p className="text-xs text-muted">{l}</p><p className="font-display text-xl font-extrabold">{v}</p></div>)}</div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Chart title="Tarefas por coluna" empty={tasks.length === 0 ? 'Sem tarefas ainda.' : null}>
          <ResponsiveContainer><BarChart data={byCol}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="name" tick={tick} /><YAxis allowDecimals={false} tick={tick} /><Tooltip {...tip} /><Bar dataKey="tarefas" fill="#F97316" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer>
        </Chart>
        <Chart title="Riscos por nível" empty={risks.length === 0 ? 'Nenhum risco registrado.' : null}>
          <ResponsiveContainer><BarChart data={byLevel}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="name" tick={tick} /><YAxis allowDecimals={false} tick={tick} /><Tooltip {...tip} />
            <Bar dataKey="riscos" radius={[3, 3, 0, 0]}>{byLevel.map((d) => <Cell key={d.name} fill={LEVEL_COLOR[d.name]} />)}</Bar></BarChart></ResponsiveContainer>
        </Chart>
        <Chart title="Progresso ao longo do tempo (tarefas concluídas acumuladas)" empty={over.length === 0 ? 'Aparece quando você concluir tarefas. Tarefas concluídas antes desta função não têm data registrada.' : null}>
          <ResponsiveContainer><LineChart data={over}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="dia" tick={tick} /><YAxis allowDecimals={false} tick={tick} /><Tooltip {...tip} /><Line dataKey="concluídas" stroke="#22C55E" strokeWidth={2} dot /></LineChart></ResponsiveContainer>
        </Chart>
      </div>
    </div>
  );
}
