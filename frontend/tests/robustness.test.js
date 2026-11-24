import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { describeError } from '../src/lib/errors.js';

const ORIGIN = 'https://x.web.app';
function loadSW(file, fetchImpl) {
  const handlers = {}; const store = new Map();
  const caches = { open: async () => ({ add: async (u) => store.set(u, new Response('cached')), put: async (r, res) => store.set(r.url, res) }),
    match: async (r) => store.get(typeof r === 'string' ? r : r.url), keys: async () => [], delete: async () => true };
  const self = { addEventListener: (t, f) => { handlers[t] = f; }, location: { origin: ORIGIN }, skipWaiting() {}, clients: { claim() {} } };
  vm.runInContext(fs.readFileSync(file, 'utf8'), vm.createContext({ self, caches, fetch: fetchImpl, Response, URL, Promise, location: self.location }));
  return { handlers, store };
}
const fire = (h, request) => { let p = null; h.fetch({ request, respondWith: (x) => { p = Promise.resolve(x); } }); return p; };
const offline = async () => { throw new TypeError('Failed to fetch'); };
const req = (path, mode = 'no-cors', method = 'GET', origin = ORIGIN) => ({ method, mode, url: origin + path });
const SW = new URL('../public/sw.js', import.meta.url);

test('sw: ignora outros domínios, /__/, POST, sw.js e rotas que não são arquivos', () => {
  const { handlers } = loadSW(SW, offline);
  assert.equal(fire(handlers, req('/v1/projects', 'cors', 'GET', 'https://firestore.googleapis.com')), null);
  assert.equal(fire(handlers, req('/__/auth/handler', 'navigate')), null);
  assert.equal(fire(handlers, req('/app/projetos/novo', 'cors', 'POST')), null);
  assert.equal(fire(handlers, req('/sw.js')), null);
  assert.equal(fire(handlers, req('/app/projetos/novo', 'cors')), null); // não-navegação e não-arquivo: deixa o navegador resolver
});
test('sw: navegação sem internet e sem cache devolve 503 em vez de erro de rede', async () => {
  const { handlers } = loadSW(SW, offline);
  const res = await fire(handlers, req('/app/projetos/novo', 'navigate'));
  assert.equal(res.status, 503);
});
test('sw: navegação sem internet usa o index.html do cache', async () => {
  const { handlers, store } = loadSW(SW, offline);
  store.set('/index.html', new Response('shell'));
  assert.equal(await (await fire(handlers, req('/app/projetos/novo', 'navigate'))).text(), 'shell');
});
test('sw: arquivo que falha na rede devolve 504 sem rejeitar a promessa', async () => {
  const { handlers } = loadSW(SW, offline);
  assert.equal((await fire(handlers, req('/assets/index-abc.js'))).status, 504);
});
test('sw: arquivo com internet é devolvido e guardado em cache', async () => {
  const { handlers, store } = loadSW(SW, async () => new Response('js', { status: 200 }));
  assert.equal(await (await fire(handlers, req('/assets/a.js'))).text(), 'js');
  await new Promise((r) => setTimeout(r, 5));
  assert.ok(store.has(ORIGIN + '/assets/a.js'));
});
test('errors: cada código vira uma mensagem com o código visível', () => {
  assert.match(describeError({ code: 'permission-denied' }), /regras.*\(permission-denied\)|permission-denied/);
  assert.match(describeError({ code: 'not-found' }), /banco Firestore/);
  assert.match(describeError({ code: 'unavailable' }), /Sem conexão/);
  assert.match(describeError({ code: 'unauthenticated' }), /sessão expirou/);
  assert.match(describeError({ message: 'Unsupported field value: undefined' }), /recusou os dados/);
  assert.match(describeError(null), /Erro inesperado/);
});
