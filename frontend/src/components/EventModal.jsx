import { useState } from 'react';
import Modal from './Modal';
import { describeError } from '../lib/errors';
import { useAuth } from '../context/AuthContext';
import { createOwned, removeOwned, updateOwned } from '../lib/crud';

const CATS = ['Evento', 'Reunião', 'Marco', 'Lembrete'];

export default function EventModal({ event, projects, projectId, start, onClose }) {
  const { user } = useAuth();
  const [f, setF] = useState(() => ({
    title: '', allDay: !start || start.length === 10, start: start || new Date().toISOString().slice(0, 10), end: '', category: 'Evento', projectId: projectId || '',
    ...(event || {}),
  }));
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const toggleAllDay = (e) => {
    const allDay = e.target.checked;
    setF((s) => ({ ...s, allDay, start: allDay ? s.start.slice(0, 10) : `${s.start.slice(0, 10)}T09:00`, end: allDay ? s.end.slice(0, 10) : s.end ? `${s.end.slice(0, 10)}T10:00` : '' }));
  };
  const save = async (e) => {
    e.preventDefault();
    if (f.title.trim().length < 2) return setErr('Informe um título (mínimo 2 letras).');
    if (!f.start) return setErr('Informe a data de início.');
    if (f.end && f.end < f.start) return setErr('O fim deve ser depois do início.');
    setBusy(true);
    const { id, ownerId, createdAt, updatedAt, ...rest } = f;
    const data = { ...rest, title: f.title.trim() };
    try { if (event) await updateOwned('events', event.id, data); else await createOwned('events', user.uid, data); onClose(); }
    catch (e) { console.error(e); setErr(describeError(e)); setBusy(false); }
  };
  const del = async () => {
    if (!window.confirm('Excluir este evento?')) return;
    try { await removeOwned('events', event.id); onClose(); } catch { setErr('Não foi possível excluir.'); }
  };
  const type = f.allDay ? 'date' : 'datetime-local';

  return (
    <Modal title={event ? 'Editar evento' : 'Novo evento'} onClose={onClose}>
      <form onSubmit={save} className="space-y-4" noValidate>
        <div><label className="label" htmlFor="et">Título</label><input id="et" className="input" value={f.title} onChange={set('title')} autoFocus /></div>
        <label className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5 accent-[#F97316]" checked={f.allDay} onChange={toggleAllDay} />Dia inteiro</label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="es">Início</label><input id="es" type={type} className="input" value={f.start} onChange={set('start')} /></div>
          <div><label className="label" htmlFor="ee">Fim (opcional)</label><input id="ee" type={type} className="input" value={f.end} onChange={set('end')} /></div>
          <div><label className="label" htmlFor="ec">Categoria</label><select id="ec" className="input" value={f.category} onChange={set('category')}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label className="label" htmlFor="ep">Projeto</label>
            <select id="ep" className="input" value={f.projectId} disabled={!!projectId} onChange={set('projectId')}><option value="">Sem projeto</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        </div>
        {err && <p role="alert" className="err">{err}</p>}
        <div className="flex justify-between gap-3 pt-2">
          {event ? <button type="button" className="btn-ghost hover:!border-red-400" onClick={del}>Excluir</button> : <span />}
          <div className="flex gap-3"><button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn-primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar'}</button></div>
        </div>
      </form>
    </Modal>
  );
}
