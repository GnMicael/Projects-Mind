import { Link } from 'react-router-dom';
import { Kanban, CalendarDays, Network, ShieldAlert, Lightbulb, SlidersHorizontal } from 'lucide-react';
import Logo from '../components/Logo';

const FEATURES = [
  { icon: Kanban, t: 'Kanban de verdade', d: 'Arraste tarefas entre colunas que você mesmo nomeia e reordena.' },
  { icon: CalendarDays, t: 'Calendário e prazos', d: 'Veja tarefas, reuniões e marcos do projeto no mesmo lugar.' },
  { icon: Network, t: 'Matriz de stakeholders', d: 'Classifique pessoas por poder e interesse e defina como se comunicar com cada uma.' },
  { icon: ShieldAlert, t: 'Riscos sob controle', d: 'Registre riscos, avalie probabilidade e impacto e planeje a resposta.' },
  { icon: Lightbulb, t: 'Banco de ideias', d: 'Guarde ideias soltas e transforme as boas em projetos.' },
  { icon: SlidersHorizontal, t: 'Feito para o seu jeito', d: 'Responda algumas perguntas e o espaço de trabalho se adapta a você.' },
];
const STEPS = [
  ['Crie sua conta', 'Leva menos de um minuto, no computador ou no celular.'],
  ['Conte como você trabalha', 'Seis perguntas rápidas definem seu painel e suas sugestões.'],
  ['Cadastre um projeto', 'Comece só com o nome e complete o resto quando quiser.'],
  ['Acompanhe o progresso', 'Tarefas, prazos e riscos ficam conectados ao projeto.'],
];
const PROFILES = [
  ['Estudantes', 'Trabalhos, provas e cronogramas de estudo.'],
  ['Desenvolvedores', 'Sprints, bugs e entregas em quadros Kanban.'],
  ['Designers e marketing', 'Campanhas, revisões e prazos de clientes.'],
  ['Empreendedores e freelancers', 'Vários projetos e clientes sem perder o fio.'],
];

export default function Landing() {
  return (
    <div>
      <header className="sticky top-0 z-30 border-b border-line bg-bg">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          <a href="#home"><Logo /></a>
          <nav className="ml-6 hidden gap-6 text-sm text-muted md:flex">
            <a href="#home" className="hover:text-ink">Início</a>
            <a href="#recursos" className="hover:text-ink">Recursos</a>
            <a href="#como-funciona" className="hover:text-ink">Como funciona</a>
            <a href="#sobre" className="hover:text-ink">Sobre</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/login" className="btn-ghost !min-h-[40px]">Entrar</Link>
            <Link to="/cadastro" className="btn-primary !min-h-[40px] hidden sm:inline-flex">Começar grátis</Link>
          </div>
        </div>
      </header>

      <section id="home" className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
        <div className="hero-rise">
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">Sua mente cria. O Project Mind organiza.</h1>
          <p className="mt-6 max-w-md text-lg text-muted">Transforme ideias em projetos organizados, acompanhe o progresso e gerencie tudo o que importa em um só espaço.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/cadastro" className="btn-primary">Começar grátis</Link>
            <a href="#recursos" className="btn-ghost">Conhecer os recursos</a>
          </div>
        </div>
        <div className="card p-4" aria-label="Exemplo do quadro Kanban">
          <p className="mb-3 text-xs text-muted">Exemplo de quadro</p>
          <div className="grid grid-cols-3 gap-3">
            {[['A fazer', ['Definir escopo', 'Listar riscos'], 'bg-line'], ['Em andamento', ['Protótipo'], 'bg-amber'], ['Concluído', ['Briefing', 'Reunião inicial'], 'bg-leaf']].map(([col, cards, c]) => (
              <div key={col}>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold"><span className={`h-2 w-2 rounded-full ${c}`} />{col}</div>
                <div className="space-y-2">{cards.map((x) => <div key={x} className="rounded border border-line bg-bg p-2 text-xs">{x}</div>)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-bg"><div className="h-full w-[55%] bg-brand" /></div>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-3xl font-extrabold">Listas de tarefas não bastam para um projeto</h2>
          <p className="mt-4 text-muted">Um projeto tem objetivos, prazos, pessoas envolvidas e riscos. Quando tudo isso fica espalhado em apps e papéis, o que importa se perde. O Project Mind junta essas peças e ajusta o espaço ao seu tipo de trabalho.</p>
        </div>
      </section>

      <section id="recursos" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-extrabold">Tudo o que um projeto precisa</h2>
        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, t, d }) => (
            <div key={t}><Icon className="text-brand" size={24} /><h3 className="mt-3 text-lg font-semibold">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></div>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-3xl font-extrabold">Como funciona</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-4">
            {STEPS.map(([t, d], i) => (
              <li key={t}><span className="font-display text-4xl font-extrabold text-brand">{i + 1}</span><h3 className="mt-2 font-semibold">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section id="sobre" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-extrabold">Para quem é</h2>
        <p className="mt-3 max-w-xl text-muted">Seus projetos. Sua mente. Sua organização. O perfil que você escolhe muda as sugestões, nunca bloqueia ferramentas.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PROFILES.map(([t, d]) => <div key={t} className="card p-5"><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></div>)}
        </div>
      </section>

      <section className="bg-brand text-[#171717]">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-14 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-extrabold">Comece seu primeiro projeto hoje.</h2>
          <Link to="/cadastro" className="btn bg-[#171717] text-white hover:bg-[#262626]">Criar conta grátis</Link>
        </div>
      </section>
      <footer className="mx-auto flex max-w-6xl items-center justify-between px-4 py-8 text-sm text-muted">
        <Logo size="text-base" /><span>© {new Date().getFullYear()} Project Mind</span>
      </footer>
    </div>
  );
}
