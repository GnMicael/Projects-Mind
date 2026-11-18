import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus } from 'lucide-react';
import FormModal from '../../components/FormModal';
import useOwned from '../../hooks/useOwned';
import { useAuth } from '../../context/AuthContext';
import { createOwned, removeOwned, updateOwned } from '../../lib/crud';

const FIELDS = [
  { key: 'title', label: 'Título', required: true }, { key: 'type', label: 'Tipo', type: 'select', options: ['Página', 'Reunião', 'Nota'], half: true },
  { key: 'category', label: 'Categoria', half: true }, { key: 'tags', label: 'Tags (separadas por vírgula)' },
  { key: 'content', label: 'Conteúdo (# título, - lista, - [ ] checklist, links http)', type: 'textarea', rows: 12 },
];
const link = (line) => line.split(/(https?:\/\/[^\s]+)/g).map((p, i) => (/^https?:\/\//.test(p) ? <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="text-brand underline">{p}</a> : p));

function Render({ text, onToggle }) {
  return text.split('\n').map((l, i) => {
    const chk = l.match(/^\s*- \[( |x)\] (.*)/i);
    if (chk) return <label key={i} className="flex min-h-[36px] items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5 accent-[#22C55E]" checked={chk[1].toLowerCase() === 'x'} onChange={() => onToggle(i)} /><span className={chk[1].toLowerCase() === 'x' ? 'text-muted line-through' : ''}>{link(chk[2])}</span></label>;
    const h = l.match(/^(#{1,3}) (.*)/);
    if (h) return <h4 key={i} className="mt-3 font-display text-lg font-semibold">{h[2]}</h4>;
    if (/^\s*[-*] /.test(l)) return <p key={i} className="pl-4 text-sm before:mr-2 before:content-['•']">{link(l.replace(/^\s*[-*] /, ''))}</p>;
    return l.trim() ? <p key={i} className="text-sm">{link(l)}</p> : <div key={i} className="h-2" />;
  });
}

export default function Notes() {
  const { project } = useOutletContext();
  const { user } = useAuth();
  const { items, loading } = useOwned('notes');
  const [sel, setSel] = useState(null);
  const [modal, setModal] = useState(null);
  const [err, setErr] = useState('');
  const notes = items.filter((n) => n.projectId === project.id).sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
  const cur = notes.find((n) => n.id === sel) || notes[0];

  const save = async (v) => {
    const data = { ...v, tags: v.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 10) };
    if (modal.item) await updateOwned('notes', modal.item.id, data);
    else { const r = await createOwned('notes', user.uid, { ...data, projectId: project.id }); setSel(r.id); }
  };
  const toggle = async (i) => {
    const lines = cur.content.split('\n');
    lines[i] = /\[ \]/.test(lines[i]) ? lines[i].replace('[ ]', '[x]') : lines[i].replace(/\[x\]/i, '[ ]');
    setErr(''); try { await updateOwned('notes', cur.id, { content: lines.join('\n') }); } catch { setErr('Não foi possível atualizar o checklist.'); }
  };
  if (loading) return <p className="text-muted">Carregando…</p>;

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <aside className="space-y-2">
        <button className="btn-primary w-full" onClick={() => setModal({})}><Plus size={16} />Nova página</button>
        {notes.length === 0 && <p className="pt-2 text-sm text-muted">Nenhuma página ainda. Use para atas de reunião, decisões e documentação.</p>}
        {notes.map((n) => <button key={n.id} onClick={() => setSel(n.id)} className={`block w-full rounded border px-3 py-2 text-left text-sm ${cur?.id === n.id ? 'border-brand bg-surface' : 'border-line text-muted hover:border-brand'}`}><span className="block font-medium text-ink">{n.title}</span>{n.type}{n.category ? ` · ${n.category}` : ''}</button>)}
      </aside>
      {cur && (
        <article className="card p-5">
          <div className="mb-4 flex items-start justify-between gap-3"><div><h3 className="text-xl font-extrabold">{cur.title}</h3>
            <p className="text-xs text-muted">{cur.type}{cur.category ? ` · ${cur.category}` : ''}{cur.tags?.length ? ` · ${cur.tags.map((t) => `#${t}`).join(' ')}` : ''}</p></div>
            <button className="btn-ghost !min-h-[40px]" onClick={() => setModal({ item: cur })}>Editar</button></div>
          {err && <p role="alert" className="err">{err}</p>}
          {cur.content ? <Render text={cur.content} onToggle={toggle} /> : <p className="text-sm text-muted">Página vazia. Use Editar para escrever.</p>}
        </article>)}
      {modal && <FormModal title={modal.item ? 'Editar página' : 'Nova página'} fields={FIELDS} initial={modal.item ? { ...modal.item, tags: (modal.item.tags || []).join(', ') } : {}} onSubmit={save} onDelete={modal.item ? () => removeOwned('notes', modal.item.id) : null} onClose={() => setModal(null)} />}
    </div>
  );
}
