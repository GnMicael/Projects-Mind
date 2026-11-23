import useOwned from './useOwned';

export default function useProjects() {
  const { items, loading, error } = useOwned('projects');
  return { projects: items, loading, error };
}
