export const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function searchAll({ projects = [], tasks = [], notes = [], ideas = [], events = [] }, query, limit = 6) {
  const q = norm(query).trim();
  if (q.length < 2) return [];
  const hit = (...fields) => fields.some((f) => norm(Array.isArray(f) ? f.join(' ') : f).includes(q));
  const pname = Object.fromEntries(projects.map((p) => [p.id, p.name]));
  const pick = (arr) => arr.slice(0, limit);
  return [
    ...pick(projects.filter((p) => hit(p.name, p.description, p.category, p.tags)).map((p) => ({ id: `p${p.id}`, kind: 'Projeto', title: p.name, sub: p.status, to: `/app/projetos/${p.id}` }))),
    ...pick(tasks.filter((t) => hit(t.title, t.description, t.labels)).map((t) => ({ id: `t${t.id}`, kind: 'Tarefa', title: t.title, sub: pname[t.projectId] || '', to: `/app/projetos/${t.projectId}/quadro` }))),
    ...pick(notes.filter((n) => hit(n.title, n.content, n.tags)).map((n) => ({ id: `n${n.id}`, kind: 'Nota', title: n.title, sub: pname[n.projectId] || '', to: `/app/projetos/${n.projectId}/notas` }))),
    ...pick(ideas.filter((i) => hit(i.title, i.content, i.tags)).map((i) => ({ id: `i${i.id}`, kind: 'Ideia', title: i.title, sub: i.status, to: '/app/brainstorm' }))),
    ...pick(events.filter((e) => hit(e.title)).map((e) => ({ id: `e${e.id}`, kind: 'Evento', title: e.title, sub: String(e.start || '').slice(0, 10), to: '/app/calendario' }))),
  ];
}
