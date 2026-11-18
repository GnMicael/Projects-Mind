const cols = (a, b, c, d) => [{ id: 'todo', name: a }, { id: 'doing', name: b }, { id: 'review', name: c }, { id: 'done', name: d }];
export const TEMPLATE_DEFS = [
  { id: 'Software', desc: 'Sprints, entregas e revisão de código.', type: 'Trabalho', method: 'Ágil / Scrum', columns: cols('Backlog', 'Em desenvolvimento', 'Em revisão', 'Entregue'),
    tasks: [['Definir requisitos', 'Alta'], ['Desenhar a arquitetura', 'Alta'], ['Configurar repositório e ambiente', 'Média'], ['Implementar a primeira funcionalidade', 'Média'], ['Escrever testes', 'Média'], ['Publicar a primeira versão', 'Alta']] },
  { id: 'Estudos', desc: 'Matérias, leituras e provas organizadas por etapa.', type: 'Estudos', method: 'Lista de tarefas', columns: cols('Para estudar', 'Estudando', 'Revisar', 'Dominado'),
    tasks: [['Listar os tópicos do conteúdo', 'Alta'], ['Montar o cronograma de estudo', 'Alta'], ['Resolver exercícios', 'Média'], ['Fazer um simulado', 'Média'], ['Revisar os pontos fracos', 'Média']] },
  { id: 'Marketing', desc: 'Campanhas do planejamento à publicação.', type: 'Trabalho', method: 'Kanban', columns: cols('Ideias', 'Em produção', 'Em aprovação', 'Publicado'),
    tasks: [['Definir objetivo e público', 'Alta'], ['Criar o calendário de conteúdo', 'Média'], ['Produzir as peças', 'Média'], ['Aprovar com o cliente', 'Alta'], ['Medir resultados', 'Média']] },
  { id: 'Evento', desc: 'Do local à avaliação final.', type: 'Trabalho', method: 'Cronograma', columns: cols('A fazer', 'Em andamento', 'Aguardando', 'Resolvido'),
    tasks: [['Definir data e orçamento', 'Alta'], ['Reservar o local', 'Alta'], ['Convidar participantes', 'Média'], ['Contratar fornecedores', 'Média'], ['Montar o roteiro do dia', 'Média'], ['Avaliar o evento', 'Baixa']] },
  { id: 'Pessoal', desc: 'Uma meta pessoal em passos pequenos.', type: 'Pessoal', method: 'Flexível', columns: cols('A fazer', 'Em andamento', 'Pausado', 'Feito'),
    tasks: [['Escrever o objetivo em uma frase', 'Alta'], ['Dividir em três etapas', 'Média'], ['Definir a primeira ação para esta semana', 'Alta']] },
];
