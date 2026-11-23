import test from 'node:test';
import assert from 'node:assert/strict';
import { norm, searchAll } from '../src/config/search.js';
import { projectHealth } from '../src/config/health.js';
import { ord, orderFor } from '../src/config/tasks.js';

const T = '2026-11-23';
test('norm: ignora acentos e maiúsculas', () => assert.equal(norm('Ação Rápida'), 'acao rapida'));
test('searchAll: acha por acento, limita e ignora consultas curtas', () => {
  const data = { projects: [{ id: 'a', name: 'Lançamento', status: 'Em andamento' }], tasks: [{ id: 't', title: 'Revisar lancamento', projectId: 'a' }], notes: [], ideas: [], events: [] };
  assert.equal(searchAll(data, 'lanc').length, 2);
  assert.equal(searchAll(data, 'l').length, 0);
  assert.equal(searchAll(data, 'zzz').length, 0);
  assert.equal(searchAll(data, 'lanc')[1].sub, 'Lançamento');
  const many = { projects: Array.from({ length: 20 }, (_, i) => ({ id: String(i), name: 'Projeto X' })) };
  assert.equal(searchAll(many, 'projeto').length, 6);
});
test('projectHealth: níveis', () => {
  assert.equal(projectHealth({ project: { status: 'Em andamento' }, tasks: [], risks: [], today: T }).label, 'No prazo');
  assert.equal(projectHealth({ project: { status: 'Concluído', endDate: '2020-01-01' }, tasks: [], risks: [], today: T }).label, 'Concluído');
  assert.equal(projectHealth({ project: { status: 'Em andamento', endDate: '2026-01-01' }, tasks: [], risks: [], today: T }).label, 'Em risco');
  const tasks = [{ status: 'todo', dueDate: '2026-11-01' }, ...Array.from({ length: 9 }, () => ({ status: 'todo' }))];
  assert.equal(projectHealth({ project: { status: 'Em andamento' }, tasks, risks: [], today: T }).label, 'Atenção');
  assert.equal(projectHealth({ project: { status: 'Em andamento' }, tasks: [], risks: [{ level: 'Crítico', status: 'Identificado' }], today: T }).label, 'Em risco');
  assert.equal(projectHealth({ project: { status: 'Em andamento' }, tasks: [], risks: [{ level: 'Crítico', status: 'Mitigado' }], today: T }).label, 'No prazo');
});
test('orderFor: entre, no início, no fim e coluna vazia', () => {
  const col = [{ id: 'a', order: 1000 }, { id: 'b', order: 2000 }, { id: 'c', order: 3000 }];
  assert.equal(orderFor(col, 'b'), 1500);
  assert.ok(orderFor(col, 'a') < 1000);
  assert.equal(orderFor(col, null), 4000);
  assert.equal(orderFor(col, 'inexistente'), 4000);
  assert.ok(orderFor([], null) > 0);
});
test('ord: usa order, senão data de criação', () => {
  assert.equal(ord({ order: 5 }), 5);
  assert.equal(ord({ createdAt: { seconds: 2 } }), 2000);
  assert.equal(ord({}), 0);
});
