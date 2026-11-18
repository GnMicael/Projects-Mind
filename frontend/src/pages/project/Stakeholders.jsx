import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DndContext, MouseSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';
import FormModal from '../../components/FormModal';
import useOwned from '../../hooks/useOwned';
import { useAuth } from '../../context/AuthContext';
import { createOwned, removeOwned, updateOwned } from '../../lib/crud';

const LV = ['Baixo', 'Alto'];
const L3 = ['Baixa', 'Média', 'Alta'];
const FIELDS = [
  { key: 'name', label: 'Nome', required: true, half: true }, { key: 'role', label: 'Cargo ou papel', half: true },
  { key: 'organization', label: 'Organização', half: true }, { key: 'contact', label: 'Contato (opcional)', half: true },
  { key: 'power', label: 'Poder', type: 'select', options: LV, default: 'Baixo', half: true },
  { key: 'interest', label: 'Interesse', type: 'select', options: LV, default: 'Baixo', half: true },
  { key: 'influence', label: 'Influência', type: 'select', options: L3, default: 'Média', half: true },
  { key: 'impact', label: 'Impacto', type: 'select', options: L3, default: 'Média', half: true },
  { key: 'description', label: 'Descrição', type: 'textarea' }, { key: 'expectations', label: 'Expectativas', type: 'textarea' },
  { key: 'communication', label: 'Estratégia de comunicação', type: 'textarea' },
];
const QUADS = [
  { id: 'Alto|Baixo', name: 'Manter satisfeito' }, { id: 'Alto|Alto', name: 'Gerenciar de perto' },
  { id: 'Baixo|Baixo', name: 'Monitorar' }, { id: 'Baixo|Alto', name: 'Manter informado' },
];

function Chip({ s, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: s.id });
  return (
    <button ref={setNodeRef} {...listeners} {...attributes} onClick={() => !isDragging && onOpen(s)} style={{ transform: CSS.Translate.toString(transform), zIndex: isDragging ? 20 : undefined }}
      className={`cursor-grab rounded border border-line bg-bg px-2 py-1 text-left text-sm ${isDragging ? 'shadow-lg' : ''}`}>{s.name}{s.role && <span className="block text-xs text-muted">{s.role}</span>}</button>
  );
}
function Quad({ q, items, onOpen }) {
  const { setNodeRef, isOver } = useDroppable({ id: q.id });
  return (
    <div ref={setNodeRef} className={`min-h-[130px] rounded-lg border p-3 ${isOver ? 'border-brand bg-brand/10' : 'border-line bg-surface'}`}>
      <p className="mb-2 text-sm font-semibold">{q.name}</p>
      <div className="flex flex-wrap gap-2">{items.map((s) => <Chip key={s.id} s={s} onOpen={onOpen} />)}</div>
    </div>
  );
}

export default function Stakeholders() {
  const { project } = useOutletContext();
  const { user } = useAuth();
  const { items, loading } = useOwned('stakeholders');
  const [modal, setModal] = useState(null);
  const [err, setErr] = useState('');
  const list = items.filter((s) => s.projectId === project.id);
  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }));

  const onDragEnd = async ({ active, over }) => {
    if (!over) return;
    const [power, interest] = over.id.split('|');
    const s = list.find((x) => x.id === active.id);
    if (s && (s.power !== power || s.interest !== interest)) { setErr(''); try { await updateOwned('stakeholders', s.id, { power, interest }); } catch { setErr('Não foi possível mover o stakeholder.'); } }
  };
  const save = (data) => (modal.item ? updateOwned('stakeholders', modal.item.id, data) : createOwned('stakeholders', user.uid, { ...data, projectId: project.id }));
  if (loading) return <p className="text-muted">Carregando…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">Arraste cada pessoa para o quadrante que representa o poder e o interesse dela.</p>
        <button className="btn-primary shrink-0" onClick={() => setModal({})}><Plus size={16} />Stakeholder</button>
      </div>
      {err && <p role="alert" className="err">{err}</p>}
      {list.length === 0 && <p className="text-sm text-muted">Nenhum stakeholder ainda. Adicione pessoas ou grupos que afetam ou são afetados pelo projeto.</p>}
      <div className="flex gap-2">
        <p className="hidden w-5 shrink-0 self-center text-xs text-muted [writing-mode:vertical-rl] sm:block" style={{ transform: 'rotate(180deg)' }}>Poder (alto no topo)</p>
        <div className="flex-1">
          <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            <div className="grid gap-3 sm:grid-cols-2">{QUADS.map((q) => <Quad key={q.id} q={q} onOpen={(s) => setModal({ item: s })} items={list.filter((s) => `${s.power}|${s.interest}` === q.id)} />)}</div>
          </DndContext>
          <p className="mt-2 text-center text-xs text-muted">Interesse (alto à direita)</p>
        </div>
      </div>
      {list.length > 0 && (
        <ul className="card divide-y divide-line">{list.map((s) => (
          <li key={s.id}><button className="flex min-h-[48px] w-full flex-wrap items-center justify-between gap-2 px-4 py-2 text-left" onClick={() => setModal({ item: s })}>
            <span className="text-sm font-medium">{s.name}<span className="text-muted">{s.role ? ` · ${s.role}` : ''}{s.organization ? ` · ${s.organization}` : ''}</span></span>
            <span className="text-xs text-muted">Poder {s.power} · Interesse {s.interest} · {QUADS.find((q) => q.id === `${s.power}|${s.interest}`)?.name}</span></button></li>))}</ul>)}
      {modal && <FormModal title={modal.item ? 'Editar stakeholder' : 'Novo stakeholder'} fields={FIELDS} initial={modal.item} onSubmit={save} onDelete={modal.item ? () => removeOwned('stakeholders', modal.item.id) : null} onClose={() => setModal(null)} />}
    </div>
  );
}
