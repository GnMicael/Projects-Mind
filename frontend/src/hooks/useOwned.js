import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeOwned } from '../lib/crud';

// Uma única assinatura por coleção, compartilhada por todos os componentes.
// Evita leituras duplicadas no plano gratuito do Firestore.
const subs = new Map();

function subscribe(name, uid, cb) {
  const key = `${name}:${uid}`;
  let s = subs.get(key);
  if (!s) {
    s = { state: { items: [], loading: true, error: '' }, cbs: new Set(), unsub: null };
    const push = (state) => { s.state = state; s.cbs.forEach((f) => f(state)); };
    s.unsub = subscribeOwned(name, uid,
      (items) => push({ items, loading: false, error: '' }),
      () => push({ items: s.state.items, loading: false, error: 'Não foi possível carregar os dados.' }));
    subs.set(key, s);
  }
  s.cbs.add(cb);
  cb(s.state);
  return () => {
    s.cbs.delete(cb);
    // espera um pouco antes de encerrar: navegar entre páginas não deve reabrir a assinatura
    setTimeout(() => { if (!s.cbs.size && subs.get(key) === s) { s.unsub(); subs.delete(key); } }, 5000);
  };
}

export default function useOwned(name) {
  const { user } = useAuth();
  const [state, setState] = useState({ items: [], loading: true, error: '' });
  useEffect(() => subscribe(name, user.uid, setState), [name, user.uid]);
  return state;
}
