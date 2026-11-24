import { useState } from 'react';
import Modal from './Modal';
import { describeError } from '../lib/errors';

const norm = (o) => (typeof o === 'string' ? { value: o, label: o } : o);

export default function FormModal({ title, fields, initial = {}, onSubmit, onDelete, onClose }) {
  const [v, setV] = useState(() => Object.fromEntries(fields.map((f) => [f.key, initial[f.key] ?? f.default ?? (f.type === 'checks' ? [] : '')])));
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k, val) => setV((s) => ({ ...s, [k]: val }));

  const submit = async (e) => {
    e.preventDefault();
    const missing = fields.find((f) => f.required && !String(v[f.key]).trim());
    if (missing) return setErr(`Preencha o campo "${missing.label}".`);
    const out = {};
    for (const f of fields) {
      const x = v[f.key];
      out[f.key] = f.type === 'number' || f.numeric ? (x === '' ? null : Number(x)) : typeof x === 'string' ? x.trim() : x;
    }
    setBusy(true); setErr('');
    try { await onSubmit(out); onClose(); } catch (e) { console.error(e); setErr(describeError(e)); setBusy(false); }
  };
  const del = async () => {
    if (!window.confirm('Excluir este item? Esta ação não pode ser desfeita.')) return;
    try { await onDelete(); onClose(); } catch { setErr('Não foi possível excluir.'); }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
        {fields.map((f, i) => {
          const id = `ff_${f.key}`;
          return (
            <div key={f.key} className={f.half ? '' : 'sm:col-span-2'}>
              <label className="label" htmlFor={id}>{f.label}{f.required ? ' *' : ''}</label>
              {f.type === 'textarea' ? <textarea id={id} rows={f.rows || 3} className="input py-2" value={v[f.key]} onChange={(e) => set(f.key, e.target.value)} autoFocus={i === 0} />
                : f.type === 'select' ? <select id={id} className="input" value={v[f.key]} onChange={(e) => set(f.key, e.target.value)}>{f.options.map(norm).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                : f.type === 'checks' ? (f.options.length === 0 ? <p className="text-sm text-muted">Nenhuma opção disponível ainda.</p> :
                  <div className="max-h-40 space-y-1 overflow-y-auto rounded border border-line p-2">{f.options.map(norm).map((o) => (
                    <label key={o.value} className="flex min-h-[36px] items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5 accent-[#F97316]" checked={v[f.key].includes(o.value)}
                      onChange={() => set(f.key, v[f.key].includes(o.value) ? v[f.key].filter((x) => x !== o.value) : [...v[f.key], o.value])} />{o.label}</label>))}</div>)
                : <input id={id} type={f.type || 'text'} min={f.min} max={f.max} className="input" value={v[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} autoFocus={i === 0} />}
            </div>
          );
        })}
        {err && <p role="alert" className="err sm:col-span-2">{err}</p>}
        <div className="flex justify-between gap-3 pt-2 sm:col-span-2">
          {onDelete ? <button type="button" className="btn-ghost hover:!border-red-400" onClick={del}>Excluir</button> : <span />}
          <div className="flex gap-3"><button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn-primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar'}</button></div>
        </div>
      </form>
    </Modal>
  );
}
