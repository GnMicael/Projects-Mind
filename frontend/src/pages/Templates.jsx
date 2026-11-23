import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createProject } from '../lib/projects';
import { createOwned } from '../lib/crud';
import { TEMPLATE_DEFS } from '../config/templates';

export default function Templates() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');

  const use = async (t) => {
    const name = window.prompt('Nome do novo projeto', `Projeto ${t.id}`);
    if (!name?.trim()) return;
    setBusy(t.id); setErr('');
    try {
      const ref = await createProject(user.uid, { name: name.trim().slice(0, 100), template: t.id, type: t.type, method: t.method, columns: t.columns, mode: 'Individual' });
      await Promise.all(t.tasks.map(([title, priority], i) => createOwned('tasks', user.uid, { order: Date.now() + i, title, priority, projectId: ref.id, status: 'todo', description: '', checklist: [], subtasks: [], labels: [] })));
      navigate(`/app/projetos/${ref.id}/quadro`);
    } catch { setErr('Não foi possível criar o projeto a partir do modelo. Tente novamente.'); setBusy(''); }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <p className="text-sm text-muted">Um modelo cria o projeto com colunas e tarefas iniciais. Você pode mudar tudo depois.</p>
      {err && <p role="alert" className="err">{err}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {TEMPLATE_DEFS.map((t) => (
          <article key={t.id} className="card flex flex-col p-5">
            <h3 className="text-lg font-semibold">{t.id}</h3><p className="mt-1 text-sm text-muted">{t.desc}</p>
            <p className="mt-3 text-xs text-muted">Colunas: {t.columns.map((c) => c.name).join(' · ')}</p>
            <p className="mt-1 text-xs text-muted">{t.tasks.length} tarefas iniciais</p>
            <button className="btn-primary mt-4 self-start" disabled={!!busy} onClick={() => use(t)}>{busy === t.id ? 'Criando…' : 'Usar modelo'}</button>
          </article>))}
      </div>
    </div>
  );
}
