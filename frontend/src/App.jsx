import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Spinner from './components/Spinner';
import RequireAuth from './components/RequireAuth';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import ComingSoon from './pages/ComingSoon';
import Projects from './pages/Projects';
import ProjectForm from './pages/ProjectForm';
import Tasks from './pages/Tasks';
const CalendarView = lazy(() => import('./pages/CalendarView'));
import ProjectLayout from './pages/project/ProjectLayout';
import Overview from './pages/project/Overview';
const Board = lazy(() => import('./pages/project/Board'));
import Timeline from './pages/project/Timeline';
const Stakeholders = lazy(() => import('./pages/project/Stakeholders'));
import Risks from './pages/project/Risks';
import Goals from './pages/project/Goals';
import Notes from './pages/project/Notes';
const Reports = lazy(() => import('./pages/project/Reports'));
import Brainstorm from './pages/Brainstorm';
import Planning from './pages/Planning';
import Templates from './pages/Templates';

const soon = (title, phase, note) => <ComingSoon title={title} phase={phase} note={note} />;

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/cadastro" element={<Auth mode="register" />} />
      <Route path="/recuperar" element={<Auth mode="reset" />} />

      <Route element={<RequireAuth needsOnboarding={false} />}>
        <Route path="/onboarding" element={<Onboarding />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/app/configuracoes/personalizar" element={<Onboarding editing />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projetos" element={<Projects />} />
          <Route path="projetos/:id/editar" element={<ProjectForm />} />
          <Route path="projetos/novo" element={<ProjectForm />} />
          <Route path="projetos/:id" element={<ProjectLayout />}>
            <Route index element={<Overview />} />
            <Route path="quadro" element={<Board />} />
            <Route path="tarefas" element={<Tasks />} />
            <Route path="calendario" element={<CalendarView />} />
            <Route path="linha-do-tempo" element={<Timeline />} />
            <Route path="stakeholders" element={<Stakeholders />} />
            <Route path="riscos" element={<Risks />} />
            <Route path="metas" element={<Goals />} />
            <Route path="notas" element={<Notes />} />
            <Route path="relatorios" element={<Reports />} />
          </Route>
          <Route path="tarefas" element={<Tasks />} />
          <Route path="calendario" element={<CalendarView />} />
          <Route path="planejamento" element={<Planning />} />
          <Route path="brainstorm" element={<Brainstorm />} />
          <Route path="modelos" element={<Templates />} />
          <Route path="configuracoes" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}
