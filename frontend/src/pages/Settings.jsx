import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { ACCENT_LIST, applyAccent, applyTheme } from '../lib/theme';
import { DATE_FORMATS, setDateFormat } from '../config/projects';
import { emailConfigured, sendFeedbackEmail } from '../lib/email';
import { usePwaInstall } from '../lib/pwa';

const FB = {
  ok: { good: true, t: 'Enviado. Obrigado pelo retorno!' },
  nomail: { good: true, t: 'Feedback salvo, mas o e-mail não pôde ser enviado agora.' },
  mailonly: { good: true, t: 'E-mail enviado (não foi possível salvar no histórico).' },
  err: { good: false, t: 'Não foi possível enviar. Tente novamente.' },
  wait: { good: false, t: 'Aguarde alguns segundos antes de enviar outro feedback.' },
};

const WA = (import.meta.env.VITE_SUPPORT_WHATSAPP || '').replace(/\D/g, '');
const MAIL = import.meta.env.VITE_SUPPORT_EMAIL || '';
const SWATCH = { laranja: '#F97316', ambar: '#FBBF24', verde: '#22C55E' };

const schema = z.object({
  category: z.enum(['bug', 'melhoria', 'recurso']),
  subject: z.string().trim().min(3, 'Informe um assunto.').max(120),
  description: z.string().trim().min(10, 'Descreva com pelo menos 10 caracteres.').max(2000),
  projectContext: z.string().trim().max(120).optional(),
});

function Section({ title, children }) {
  return <section className="card p-5"><h2 className="mb-4 text-lg font-semibold">{title}</h2>{children}</section>;
}
function Choice({ on, children, ...p }) {
  return <button aria-pressed={on} className={`btn ${on ? 'bg-brand text-[#171717]' : 'border border-line'}`} {...p}>{children}</button>;
}

export default function Settings() {
  const { user, profile, saveProfile, reset } = useAuth();
  const pwa = usePwaInstall();
  const notif = prefs.notifications || {};
  const [theme, setTheme] = useState(localStorage.getItem('pm-theme') || 'dark');
  const [accent, setAccent] = useState(localStorage.getItem('pm-accent') || 'laranja');
  const [datefmt, setDatefmt] = useState(localStorage.getItem('pm-datefmt') || 'dmy');
  const [name, setName] = useState(profile?.name || '');
  const [note, setNote] = useState({});
  const [sent, setSent] = useState('');
  const { register, handleSubmit, reset: resetForm, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { category: 'bug' } });

  const say = (k, type, text) => setNote((n) => ({ ...n, [k]: { type, text } }));
  const Note = ({ k }) => note[k] ? <p role="status" className={`mt-2 text-sm ${note[k].type === 'ok' ? 'text-leaf' : 'text-red-400'}`}>{note[k].text}</p> : null;
  const savePrefs = (patch, k) => saveProfile({ prefs: patch }).catch(() => say(k, 'err', 'Não foi possível salvar a preferência.'));

  const saveName = async () => {
    if (name.trim().length < 2) return say('name', 'err', 'Informe pelo menos 2 letras.');
    try { await updateProfile(auth.currentUser, { displayName: name.trim() }); await saveProfile({ name: name.trim() }); say('name', 'ok', 'Nome atualizado.'); }
    catch { say('name', 'err', 'Não foi possível atualizar o nome.'); }
  };
  const sendReset = async () => {
    try { await reset(user.email); say('pw', 'ok', `Enviamos um link para ${user.email}. Contas que entram só com Google não usam senha.`); }
    catch { say('pw', 'err', 'Não foi possível enviar o e-mail agora.'); }
  };
  const submit = async (v) => {
    setSent('');
    if (Date.now() - Number(localStorage.getItem('pm-fb-last') || 0) < 30000) return setSent('wait');
    let saved = false; let mailed = false;
    try { await addDoc(collection(db, 'feedback'), { ...v, ownerId: user.uid, email: user.email, createdAt: serverTimestamp() }); saved = true; } catch { /* tenta o e-mail mesmo assim */ }
    if (emailConfigured) {
      try { mailed = await sendFeedbackEmail({ ...v, name: profile?.name || user.displayName || '', email: user.email, uid: user.uid }); } catch { /* tratado abaixo */ }
    }
    if (!saved && !mailed) return setSent('err');
    localStorage.setItem('pm-fb-last', String(Date.now()));
    resetForm({ category: 'bug', subject: '', description: '', projectContext: '' });
    setSent(saved && (mailed || !emailConfigured) ? 'ok' : saved ? 'nomail' : 'mailonly');
  };
  const Toggle = ({ k, label, hint }) => (
    <label className="flex min-h-[48px] items-center justify-between gap-4 text-sm"><span>{label}<span className="block text-xs text-muted">{hint}</span></span>
      <input type="checkbox" className="h-5 w-5 accent-[#F97316]" checked={notif[k] !== false} onChange={(e) => savePrefs({ notifications: { [k]: e.target.checked } }, 'notif')} /></label>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Section title="Conta">
        <label className="label" htmlFor="nm">Nome</label>
        <div className="flex gap-2"><input id="nm" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /><button className="btn-ghost" onClick={saveName}>Salvar</button></div>
        <Note k="name" />
        <p className="mt-4 text-sm"><span className="text-muted">E-mail: </span>{user?.email}</p>
        <p className="mt-1 text-xs text-muted">A foto do perfil vem da sua conta Google, quando houver. Envio de foto própria fica para uma próxima versão.</p>
        <button className="btn-ghost mt-4" onClick={sendReset}>Redefinir senha por e-mail</button><Note k="pw" />
      </Section>

      <Section title="Preferências">
        <p className="label">Tema</p>
        <div className="flex flex-wrap gap-2">{[['dark', 'Escuro'], ['light', 'Claro'], ['system', 'Sistema']].map(([t, l]) => <Choice key={t} on={theme === t} onClick={() => { applyTheme(t); setTheme(t); savePrefs({ theme: t }, 'pref'); }}>{l}</Choice>)}</div>
        <p className="label mt-5">Cor de destaque</p>
        <div className="flex flex-wrap gap-2">{ACCENT_LIST.map(([k, l]) => <Choice key={k} on={accent === k} onClick={() => { applyAccent(k); setAccent(k); savePrefs({ accent: k }, 'pref'); }}><span className="h-3 w-3 rounded-full" style={{ background: SWATCH[k] }} />{l}</Choice>)}</div>
        <label className="label mt-5" htmlFor="df">Formato de data</label>
        <select id="df" className="input" value={datefmt} onChange={(e) => { setDateFormat(e.target.value); setDatefmt(e.target.value); savePrefs({ dateFormat: e.target.value }, 'pref'); }}>{DATE_FORMATS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <label className="label mt-5" htmlFor="lg">Idioma</label>
        <select id="lg" className="input" disabled><option>Português (Brasil)</option></select>
        <p className="mt-1 text-xs text-muted">Outros idiomas ainda não estão disponíveis.</p><Note k="pref" />
      </Section>

      <Section title="Personalização">
        <p className="text-sm text-muted">Perfil: {(profile?.professions || []).join(', ') || '—'}. Finalidade: {(profile?.purposes || []).join(', ') || '—'}. Estilo: {profile?.style || '—'}. Nível: {profile?.level || '—'}.</p>
        <Link to="/app/configuracoes/personalizar" className="btn-ghost mt-4">Refazer perguntas iniciais</Link>
      </Section>

      <Section title="Notificações">
        <Toggle k="upcoming" label="Tarefas atrasadas e que vencem em breve" hint="Vencidas ou com prazo nos próximos 2 dias." />
        <Toggle k="deadlines" label="Prazos de projetos" hint="Projetos ativos com prazo nos próximos 7 dias." />
        <p className="mt-2 text-xs text-muted">Os avisos aparecem no sino da barra superior. Envio por e-mail ou push ainda não existe.</p><Note k="notif" />
      </Section>

      <Section title="Instalar no celular">
        {pwa.installed ? <p className="text-sm text-muted">O app já está instalado neste aparelho.</p>
          : pwa.available ? <button className="btn-primary" onClick={pwa.prompt}>Instalar Project Mind</button>
          : <p className="text-sm text-muted">No iPhone (Safari): toque em Compartilhar e depois em “Adicionar à Tela de Início”. No Android (Chrome): menu ⋮ e “Instalar app”.</p>}
      </Section>

      <Section title="Suporte">
        {WA || MAIL ? (
          <div className="mb-5 flex flex-wrap gap-2">
            {WA && <a className="btn-ghost" href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
            {MAIL && <a className="btn-ghost" href={`mailto:${MAIL}`}>{MAIL}</a>}
          </div>
        ) : <p className="mb-5 text-sm text-muted">Defina VITE_SUPPORT_WHATSAPP e VITE_SUPPORT_EMAIL no arquivo .env para exibir seus contatos aqui.</p>}
        <form onSubmit={handleSubmit(submit)} className="space-y-3" noValidate>
          <div><label className="label" htmlFor="c">Tipo</label>
            <select id="c" className="input" {...register('category')}><option value="bug">Reportar um erro</option><option value="melhoria">Sugerir melhoria</option><option value="recurso">Pedir um recurso</option></select></div>
          <div><label className="label" htmlFor="s">Assunto</label><input id="s" className="input" {...register('subject')} />{errors.subject && <p className="err">{errors.subject.message}</p>}</div>
          <div><label className="label" htmlFor="d">Descrição</label><textarea id="d" rows={4} className="input py-2" {...register('description')} />{errors.description && <p className="err">{errors.description.message}</p>}</div>
          <div><label className="label" htmlFor="pc">Projeto relacionado (opcional)</label><input id="pc" className="input" {...register('projectContext')} /></div>
          {FB[sent] && <p role="status" className={`text-sm ${FB[sent].good ? 'text-leaf' : 'text-red-400'}`}>{FB[sent].t}</p>}
          <button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Enviando…' : 'Enviar feedback'}</button>
        </form>
      </Section>
    </div>
  );
}
