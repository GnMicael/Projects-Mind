import test from 'node:test';
import assert from 'node:assert/strict';
import { recommend } from '../src/config/onboarding.js';
import { levelOf } from '../src/config/risks.js';
import { columnsOf, DEFAULT_COLUMNS } from '../src/config/tasks.js';
import { addDays, fmtDate, setDateFormat, today } from '../src/config/projects.js';
import { TEMPLATE_DEFS } from '../src/config/templates.js';

test('recommend: sempre devolve ao menos uma sugestão', () => {
  assert.ok(recommend({}).length >= 1);
  assert.ok(recommend(undefined).length >= 1);
});
test('recommend: Kanban + equipes + avançado sugere quadro, stakeholders e riscos', () => {
  const ids = recommend({ style: 'Kanban', wants: ['Equipes'], purposes: [], level: 'Avançado' }).map((r) => r.id);
  for (const id of ['kanban', 'stake', 'risk', 'time']) assert.ok(ids.includes(id), id);
});
test('recommend: sem duplicados', () => {
  const r = recommend({ style: 'Baseado em calendário', wants: ['Prazos', 'Eventos', 'Reuniões'] });
  assert.equal(new Set(r.map((x) => x.id)).size, r.length);
});
test('levelOf: limites da matriz 5x5', () => {
  assert.equal(levelOf(1, 1), 'Baixo'); assert.equal(levelOf(2, 2), 'Baixo');
  assert.equal(levelOf(1, 5), 'Médio'); assert.equal(levelOf(3, 3), 'Médio');
  assert.equal(levelOf(2, 5), 'Alto'); assert.equal(levelOf(3, 4), 'Alto');
  assert.equal(levelOf(3, 5), 'Crítico'); assert.equal(levelOf(5, 5), 'Crítico');
});
test('columnsOf: usa padrão quando o projeto não tem colunas', () => {
  assert.deepEqual(columnsOf({}), DEFAULT_COLUMNS);
  assert.deepEqual(columnsOf(null), DEFAULT_COLUMNS);
  assert.equal(columnsOf({ columns: [{ id: 'x', name: 'X' }] })[0].id, 'x');
});
test('fmtDate: formatos e vazio', () => {
  assert.equal(fmtDate(''), '—');
  setDateFormat('dmy'); assert.equal(fmtDate('2026-11-18'), '18/11/2026');
  setDateFormat('mdy'); assert.equal(fmtDate('2026-11-18'), '11/18/2026');
  setDateFormat('ymd'); assert.equal(fmtDate('2026-11-18'), '2026-11-18');
  setDateFormat('invalido'); assert.equal(fmtDate('2026-11-18'), '18/11/2026');
});
test('today/addDays: formato AAAA-MM-DD e ordem', () => {
  assert.match(today(), /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(addDays(1) > today()); assert.ok(addDays(-1) < today());
});
test('modelos: colunas com ids padrão e tarefas válidas', () => {
  for (const t of TEMPLATE_DEFS) {
    assert.deepEqual(t.columns.map((c) => c.id), ['todo', 'doing', 'review', 'done'], t.id);
    assert.ok(t.tasks.length > 0 && t.tasks.every(([title, p]) => title && ['Baixa', 'Média', 'Alta', 'Urgente'].includes(p)), t.id);
  }
});
