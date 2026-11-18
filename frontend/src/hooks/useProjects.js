import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeProjects } from '../lib/projects';

export default function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => subscribeProjects(user.uid,
    (p) => { setProjects(p); setLoading(false); },
    () => { setError('Não foi possível carregar seus projetos.'); setLoading(false); }), [user.uid]);
  return { projects, loading, error };
}
