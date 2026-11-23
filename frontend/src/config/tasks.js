export const DEFAULT_COLUMNS = [
  { id: 'todo', name: 'A fazer' }, { id: 'doing', name: 'Em andamento' },
  { id: 'review', name: 'Em revisão' }, { id: 'done', name: 'Concluído' },
];
export const columnsOf = (project) => (project?.columns?.length ? project.columns : DEFAULT_COLUMNS);
export const isDone = (t) => t.status === 'done';
export const uid = () => Math.random().toString(36).slice(2, 9);

// Ordem dentro da coluna: números (ms). Tarefas antigas usam a data de criação.
export const ord = (t) => t.order ?? (t.createdAt?.seconds || 0) * 1000;
// Calcula a ordem de uma tarefa solta antes de `beforeId` (ou no fim, se for null).
// `columnTasks` deve estar ordenada e sem a tarefa arrastada.
export function orderFor(columnTasks, beforeId = null) {
  if (!columnTasks.length) return Date.now();
  const end = ord(columnTasks[columnTasks.length - 1]) + 1000;
  if (beforeId == null) return end;
  const i = columnTasks.findIndex((t) => t.id === beforeId);
  if (i < 0) return end;
  const next = ord(columnTasks[i]);
  const prev = i > 0 ? ord(columnTasks[i - 1]) : next - 2000;
  return (prev + next) / 2;
}
