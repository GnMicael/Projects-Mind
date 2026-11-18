export const STEPS = [
  { key: 'professions', title: 'Que tipo de profissional você é?', hint: 'Escolha quantos quiser.', multi: true,
    options: ['Estudante', 'Desenvolvedor / Programador', 'Designer / UI/UX', 'Profissional de marketing', 'Empreendedor', 'Gerente de projetos', 'Freelancer', 'Criador de conteúdo', 'Pesquisador', 'Outro'] },
  { key: 'purposes', title: 'Para que você vai usar o Project Mind?', hint: 'Escolha quantos quiser.', multi: true,
    options: ['Trabalho', 'Estudos', 'Projetos pessoais', 'Negócios', 'Hobbies', 'Projetos em equipe', 'Organizar ideias', 'Produtividade pessoal'] },
  { key: 'style', title: 'Como você prefere se organizar?', hint: 'Escolha uma opção.', multi: false,
    options: ['Listas simples', 'Kanban', 'Baseado em calendário', 'Planejamento detalhado', 'Organização flexível', 'Ainda não tenho um método'] },
  { key: 'wants', title: 'O que você quer organizar?', hint: 'Escolha quantos quiser.', multi: true,
    options: ['Projetos', 'Tarefas', 'Metas', 'Equipes', 'Estudos', 'Ideias', 'Eventos', 'Prazos', 'Reuniões'] },
  { key: 'level', title: 'Qual nível de organização você quer?', hint: 'Você pode mudar depois em Configurações.', multi: false,
    options: ['Simples', 'Intermediário', 'Avançado'] },
];

// Recomendações = sugestões. Nenhuma ferramenta fica bloqueada.
export function recommend(p = {}) {
  const out = new Map();
  const add = (id, label, to, why) => out.set(id, { id, label, to, why });
  const has = (k, v) => (p[k] || []).includes(v);

  if (p.style === 'Kanban') add('kanban', 'Quadro Kanban', '/app/projetos', 'Você prefere Kanban.');
  if (p.style === 'Baseado em calendário') add('cal', 'Calendário', '/app/calendario', 'Você prefere organizar por datas.');
  if (p.style === 'Listas simples') add('tasks', 'Tarefas', '/app/tarefas', 'Você prefere listas simples.');
  if (p.style === 'Planejamento detalhado') add('plan', 'Planejamento', '/app/planejamento', 'Você prefere planejar em detalhes.');
  if (p.style === 'Organização flexível' || p.style === 'Ainda não tenho um método') add('tpl', 'Modelos', '/app/modelos', 'Comece com um modelo pronto.');
  if (has('wants', 'Ideias') || has('purposes', 'Organizar ideias')) add('idea', 'Brainstorm', '/app/brainstorm', 'Você quer organizar ideias.');
  if (has('wants', 'Equipes') || has('purposes', 'Projetos em equipe')) add('stake', 'Matriz de stakeholders', '/app/planejamento', 'Você trabalha com equipes.');
  if (['Prazos', 'Eventos', 'Reuniões'].some((v) => has('wants', v))) add('cal', 'Calendário', '/app/calendario', 'Você quer controlar prazos e eventos.');
  if (p.level === 'Avançado') { add('risk', 'Gestão de riscos', '/app/planejamento', 'Nível avançado.'); add('time', 'Linha do tempo', '/app/planejamento', 'Nível avançado.'); }
  if (out.size === 0) add('proj', 'Criar projeto', '/app/projetos/novo', 'Um bom primeiro passo.');
  return [...out.values()];
}
