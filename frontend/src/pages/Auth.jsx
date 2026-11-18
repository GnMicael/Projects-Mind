import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const email = z.string().min(1, 'Informe seu e-mail.').email('E-mail inválido.');
const password = z.string().min(8, 'Use pelo menos 8 caracteres.');
const SCHEMAS = {
  login: z.object({ email, password: z.string().min(1, 'Informe sua senha.') }),
  register: z.object({ name: z.string().trim().min(2, 'Informe seu nome.'), email, password }),
  reset: z.object({ email }),
};
const COPY = {
  login: { title: 'Entrar', cta: 'Entrar' },
  register: { title: 'Criar conta', cta: 'Criar conta' },
  reset: { title: 'Recuperar senha', cta: 'Enviar link de recuperação' },
};
const ERRORS = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'Este e-mail já tem conta. Tente entrar.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
  'auth/network-request-failed': 'Sem conexão. Verifique sua internet.',
  'auth/popup-closed-by-user': 'Login com Google cancelado.',
};

function Field({ name, label, type = 'text', auto, register, error }) {
  return (
    <div><label className="label" htmlFor={name}>{label}</label>
      <input id={name} type={type} autoComplete={auto} className="input" {...register(name)} />
      {error && <p className="err">{error.message}</p>}
    </div>
  );
}

export default function Auth({ mode }) {
  const { user, login, register: signUp, reset, google } = useAuth();
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const from = useLocation().state?.from || '/app';
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(SCHEMAS[mode]) });

  if (user) return <Navigate to={from} replace />;

  const run = async (fn) => {
    setBusy(true); setMsg({ type: '', text: '' });
    try { await fn(); } catch (e) { setMsg({ type: 'err', text: ERRORS[e.code] || 'Algo deu errado. Tente novamente.' }); }
    setBusy(false);
  };
  const onSubmit = (v) => run(async () => {
    if (mode === 'login') await login(v);
    if (mode === 'register') { await signUp(v); navigate('/onboarding'); }
    if (mode === 'reset') { await reset(v.email); setMsg({ type: 'ok', text: 'Se o e-mail tiver conta, você receberá o link em instantes.' }); }
  });
  const f = { register, };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/"><Logo size="text-2xl" /></Link>
        <h1 className="mt-8 text-2xl font-extrabold">{COPY[mode].title}</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          {mode === 'register' && <Field {...f} name="name" label="Nome" auto="name" error={errors.name} />}
          <Field {...f} name="email" label="E-mail" type="email" auto="email" error={errors.email} />
          {mode !== 'reset' && <Field {...f} name="password" label="Senha" type="password" auto={mode === 'login' ? 'current-password' : 'new-password'} error={errors.password} />}
          {msg.text && <p role="alert" className={msg.type === 'ok' ? 'text-sm text-leaf' : 'err'}>{msg.text}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Aguarde…' : COPY[mode].cta}</button>
        </form>
        {mode !== 'reset' && <button className="btn-ghost mt-3 w-full" disabled={busy} onClick={() => run(google)}>Continuar com Google</button>}
        <div className="mt-6 space-y-2 text-sm text-muted">
          {mode === 'login' && <><p><Link className="text-brand" to="/recuperar">Esqueci minha senha</Link></p><p>Novo por aqui? <Link className="text-brand" to="/cadastro">Criar conta</Link></p></>}
          {mode === 'register' && <p>Já tem conta? <Link className="text-brand" to="/login">Entrar</Link></p>}
          {mode === 'reset' && <p><Link className="text-brand" to="/login">Voltar para o login</Link></p>}
        </div>
      </div>
    </div>
  );
}
