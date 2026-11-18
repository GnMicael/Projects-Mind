export const DEFAULT_COLUMNS = [
  { id: 'todo', name: 'A fazer' }, { id: 'doing', name: 'Em andamento' },
  { id: 'review', name: 'Em revisão' }, { id: 'done', name: 'Concluído' },
];
export const columnsOf = (project) => (project?.columns?.length ? project.columns : DEFAULT_COLUMNS);
export const isDone = (t) => t.status === 'done';
export const uid = () => Math.random().toString(36).slice(2, 9);
