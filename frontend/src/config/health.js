const LABELS = ['No prazo', 'Atenção', 'Em risco'];

export function projectHealth({ project, tasks = [], risks = [], today }) {
  if (project.status === 'Concluído') return { label: 'Concluído', level: 0, reasons: [] };
  const reasons = [];
  let level = 0;
  const open = tasks.filter((t) => t.status !== 'done');
  const late = open.filter((t) => t.dueDate && t.dueDate < today);
  if (project.endDate && project.endDate < today && project.status !== 'Arquivado') { level = 2; reasons.push('O prazo do projeto já passou.'); }
  if (late.length) { level = Math.max(level, late.length / open.length >= 0.3 ? 2 : 1); reasons.push(`${late.length} tarefa(s) atrasada(s).`); }
  const bad = risks.filter((r) => ['Alto', 'Crítico'].includes(r.level) && !['Mitigado', 'Encerrado'].includes(r.status));
  if (bad.length) { level = Math.max(level, bad.some((r) => r.level === 'Crítico') ? 2 : 1); reasons.push(`${bad.length} risco(s) alto(s) ou crítico(s) em aberto.`); }
  return { label: LABELS[level], level, reasons };
}
