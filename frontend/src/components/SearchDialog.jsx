import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import useOwned from '../hooks/useOwned';
import { searchAll } from '../config/search';

export default function SearchDialog({ onClose }) {
  const navigate = useNavigate();
  const { items: projects } = useOwned('projects');
  const { items: tasks } = useOwned('tasks');
  const { items: notes } = useOwned('notes');
  const { items: ideas } = useOwned('ideas');
  const { items: events } = useOwned('events');
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const results = useMemo(() => searchAll({ projects, tasks, notes, ideas, events }, q), [projects, tasks, notes, ideas, events, q]);
  const go = (r) => { navigate(r.to); onClose(); };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && results[active]) go(results[active]);
  };

  return (
    <Modal title="Buscar" onClose={onClose}>
      <input autoFocus className="input" value={q} placeholder="Projetos, tarefas, notas, ideias, eventos…" aria-label="Buscar" onKeyDown={onKey} onChange={(e) => { setQ(e.target.value); setActive(0); }} />
      <div className="mt-3 max-h-[50vh] overflow-y-auto">
        {q.trim().length < 2 ? <p className="p-2 text-sm text-muted">Digite pelo menos 2 letras.</p>
          : results.length === 0 ? <p className="p-2 text-sm text-muted">Nada encontrado para “{q}”.</p>
          : <ul role="listbox">{results.map((r, i) => (
            <li key={r.id} role="option" aria-selected={i === active}>
              <button onClick={() => go(r)} onMouseEnter={() => setActive(i)} className={`flex min-h-[48px] w-full items-center gap-3 rounded px-3 py-2 text-left ${i === active ? 'bg-bg' : ''}`}>
                <span className="w-16 shrink-0 text-xs font-semibold text-brand">{r.kind}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{r.title}</span>{r.sub && <span className="block truncate text-xs text-muted">{r.sub}</span>}</span>
              </button>
            </li>))}</ul>}
      </div>
    </Modal>
  );
}
