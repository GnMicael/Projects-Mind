import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeOwned } from '../lib/crud';

export default function useOwned(name) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => subscribeOwned(name, user.uid,
    (d) => { setItems(d); setLoading(false); },
    () => { setError('Não foi possível carregar os dados.'); setLoading(false); }), [name, user.uid]);
  return { items, loading, error };
}
