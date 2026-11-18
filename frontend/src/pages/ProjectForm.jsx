import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { createProject, getProject, updateProject } from '../lib/projects';
import { METHODS, PRIORITY, STATUS, TEMPLATES, TYPES } from '../config/projects';

const opt = z.string().trim().max(2000).optional();
const schema = z.object({
  name: z.string().trim().min(2, 'Dê um nome ao projeto (mínimo 2 letras).').max(100),
  description: opt, category: z.string().trim().max(60).optional(), tags: z.string().max(200).optional(),
  type: z.string().optional(), priority: z.string().optional(), status: z.string().optional(),
  mainObjective: opt, expectedResults: opt, successCriteria: opt, scope: opt, notes: opt,
  startDate: z.string().optional(), endDate: z.string().optional(), estimatedDuration: z.string().trim().max(60).optional(),
  milestones: opt, mode: z.string().optional(), method: z.string().optional(), template: z.string().optional(),
  resources: opt, dependencies: opt, risks: opt, difficulties: opt, constraints: opt,
  progress: z.coerce.number().min(0).max(100).optional(),
}).refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, { path: ['endDate'], message: 'A data final deve ser depois da inicial.' });

function F({ label, error, children, id }) {
  return <div><label className="label" htmlFor={id}>{label}</label>{children}{error && <p className="err">{error.message}</p>}</div>;
}
const Sel = ({ list, ...p }) => <select className="input" {...p}>{list.map((o) => <option key={o}>{o}</option>)}</select>;

export default function ProjectForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [more, setMore] = useState(!!id);
  const [loading, setLoading] = useState(!!id);
  const [err, setErr] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: 'Planejamento', priority: 'Média', type: 'Trabalho', mode: 'Individual', method: 'Kanban', template: 'Em branco', progress: 0 },
  });

  useEffect(() => {
    if (!id) return;
    getProject(id).then((p) => {
      if (!p || p.ownerId !== user.uid) { navigate('/app/projetos', { replace: true }); return; }
      reset({ ...p, tags: (p.tags || []).join(', ') }); setLoading(false);
    }).catch(() => { setErr('Não foi possível carregar o projeto.'); setLoading(false); });
  }, [id, user.uid, navigate, reset]);

  const onSubmit = async (v) => {
    setErr('');
    const data = { ...v, tags: (v.tags || '').split(',').map((t) => t.trim()).filter(Boolean).slice(0, 10) };
    try {
      if (id) await updateProject(id, data); else await createProject(user.uid, data);
      navigate('/app/projetos');
    } catch { setErr('Não foi possível salvar. Verifique sua conexão e tente de novo.'); }
  };

  if (loading) return <p className="text-muted">Carregando…</p>;
  const Area = (name, label, rows = 3) => <F label={label} id={name} error={errors[name]}><textarea id={name} rows={rows} className="input py-2" {...register(name)} /></F>;
  const Group = ({ title, children }) => <fieldset className="card space-y-4 p-5"><legend className="px-1 font-display text-lg font-semibold">{title}</legend>{children}</fieldset>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-extrabold">{id ? 'Editar projeto' : 'Novo projeto'}</h2>
      <Group title="Essencial">
        <F label="Nome do projeto" id="name" error={errors.name}><input id="name" className="input" {...register('name')} /></F>
        {Area('description', 'Descrição', 3)}
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Prioridade" id="priority"><Sel id="priority" list={PRIORITY} {...register('priority')} /></F>
          <F label="Prazo final" id="endDate" error={errors.endDate}><input id="endDate" type="date" className="input" {...register('endDate')} /></F>
        </div>
      </Group>

      {!more && <button type="button" className="btn-ghost w-full" onClick={() => setMore(true)}>Adicionar mais detalhes (opcional)</button>}

      {more && <>
        <Group title="Informações básicas">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Categoria" id="category"><input id="category" className="input" {...register('category')} /></F>
            <F label="Tipo" id="type"><Sel id="type" list={TYPES} {...register('type')} /></F>
          </div>
          <F label="Tags (separadas por vírgula)" id="tags"><input id="tags" className="input" {...register('tags')} /></F>
          <F label="Status" id="status"><Sel id="status" list={STATUS} {...register('status')} /></F>
          <F label="Progresso (%) — manual até as tarefas existirem" id="progress" error={errors.progress}><input id="progress" type="number" min="0" max="100" className="input" {...register('progress')} /></F>
        </Group>
        <Group title="Objetivos">
          {Area('mainObjective', 'Objetivo principal')}{Area('expectedResults', 'Resultados esperados')}
          {Area('successCriteria', 'Critérios de sucesso')}{Area('scope', 'Escopo')}{Area('notes', 'Observações')}
        </Group>
        <Group title="Planejamento">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Data de início" id="startDate"><input id="startDate" type="date" className="input" {...register('startDate')} /></F>
            <F label="Duração estimada" id="estimatedDuration"><input id="estimatedDuration" placeholder="ex.: 3 semanas" className="input" {...register('estimatedDuration')} /></F>
          </div>
          {Area('milestones', 'Marcos do projeto (um por linha)')}
        </Group>
        <Group title="Organização">
          <div className="grid gap-4 sm:grid-cols-3">
            <F label="Formato" id="mode"><Sel id="mode" list={['Individual', 'Em equipe']} {...register('mode')} /></F>
            <F label="Método" id="method"><Sel id="method" list={METHODS} {...register('method')} /></F>
            <F label="Modelo" id="template"><Sel id="template" list={TEMPLATES} {...register('template')} /></F>
          </div>
          {Area('resources', 'Recursos necessários')}{Area('dependencies', 'Dependências')}
        </Group>
        <Group title="Riscos">
          {Area('risks', 'Riscos iniciais')}{Area('difficulties', 'Possíveis dificuldades')}{Area('constraints', 'Restrições')}
        </Group>
      </>}

      {err && <p role="alert" className="err">{err}</p>}
      <div className="flex justify-end gap-3 pb-8">
        <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>Cancelar</button>
        <button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Salvando…' : id ? 'Salvar alterações' : 'Criar projeto'}</button>
      </div>
    </form>
  );
}
