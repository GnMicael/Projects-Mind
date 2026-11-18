import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { STEPS } from '../config/onboarding';
import Logo from '../components/Logo';

export default function Onboarding({ editing = false }) {
  const { profile, user, saveProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile?.name || user?.displayName || '');
  const [answers, setAnswers] = useState({
    professions: profile?.professions || [], purposes: profile?.purposes || [],
    style: profile?.style || '', wants: profile?.wants || [], level: profile?.level || '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const total = STEPS.length + 1;
  const cfg = STEPS[step - 1];
  const value = cfg ? answers[cfg.key] : null;
  const valid = step === 0 ? name.trim().length >= 2 : cfg.multi ? value.length > 0 : !!value;

  const pick = (opt) => setAnswers((a) => {
    if (!cfg.multi) return { ...a, [cfg.key]: opt };
    const cur = a[cfg.key];
    return { ...a, [cfg.key]: cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt] };
  });

  const finish = async () => {
    setBusy(true); setError('');
    try { await saveProfile({ name: name.trim(), ...answers, onboardingCompleted: true }); navigate(editing ? '/app/configuracoes' : '/app', { replace: true }); }
    catch { setError('Não foi possível salvar. Verifique sua conexão e tente de novo.'); setBusy(false); }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-8">
      <Logo />
      <div className="mt-8" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={total}>
        <div className="h-1.5 rounded-full bg-line"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${((step + 1) / total) * 100}%` }} /></div>
        <p className="mt-2 text-sm text-muted">Etapa {step + 1} de {total}</p>
      </div>

      <div className="mt-8 flex-1">
        {step === 0 ? (
          <>
            <h1 className="text-2xl font-extrabold">Como podemos chamar você?</h1>
            <label className="label mt-6" htmlFor="n">Nome</label>
            <input id="n" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            <p className="mt-2 text-sm text-muted">Foto de perfil entra em uma próxima versão.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold">{cfg.title}</h1>
            <p className="mt-1 text-sm text-muted">{cfg.hint}</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {cfg.options.map((o) => {
                const on = cfg.multi ? value.includes(o) : value === o;
                return (
                  <button key={o} type="button" onClick={() => pick(o)} aria-pressed={on}
                    className={`min-h-[48px] rounded border px-3 text-left text-sm font-medium ${on ? 'border-brand bg-brand/15 text-ink' : 'border-line text-muted hover:border-brand'}`}>{o}</button>
                );
              })}
            </div>
          </>
        )}
        {error && <p role="alert" className="err mt-4">{error}</p>}
      </div>

      <div className="mt-8 flex justify-between gap-3">
        <button className="btn-ghost" disabled={step === 0 || busy} onClick={() => setStep(step - 1)}>Voltar</button>
        {step < total - 1
          ? <button className="btn-primary" disabled={!valid} onClick={() => setStep(step + 1)}>Continuar</button>
          : <button className="btn-primary" disabled={!valid || busy} onClick={finish}>{busy ? 'Salvando…' : 'Concluir'}</button>}
      </div>
    </div>
  );
}
