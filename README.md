# Project Mind

Plataforma de organização de projetos: React + Vite + Tailwind, Node/Express e Firebase (plano gratuito).

## O que existe (Fases 1 a 6)
- **Público:** home, cadastro, login (e-mail/senha e Google), recuperação de senha.
- **Onboarding** de 6 etapas que personaliza as sugestões do dashboard (nada fica bloqueado).
- **Projetos:** criar (rápido ou completo), editar, duplicar, favoritar, arquivar, excluir, busca, filtros, grade/lista.
- **Espaço de trabalho do projeto:** visão geral, quadro Kanban (arrastar e soltar, colunas personalizáveis), tarefas
  (subtarefas, checklist), calendário, linha do tempo, stakeholders (matriz poder × interesse), riscos (matriz 5×5),
  metas e marcos, notas, relatórios com gráficos.
- **Globais:** dashboard com dados reais, tarefas, calendário, brainstorm (ideia vira tarefa ou projeto), planejamento, modelos de projeto.
- **Configurações:** nome, redefinição de senha, tema (escuro/claro/sistema), cor de destaque, formato de data,
  notificações no sino, suporte (contatos configuráveis) e feedback salvo no Firestore.
- **API Express** modular (`backend/`): health e `/users/me`, com verificação de token, validação e limite de requisições.
  O frontend usa o Firestore direto, protegido pelas regras; a API é a base para operações que precisem de servidor.

## Como rodar
1. Firebase Console → crie um projeto → Authentication (ative E-mail/senha e Google) → Firestore.
   Configurações do projeto → Seus apps → Web: copie as chaves.
2. `cd frontend && cp .env.example .env` (preencha) `&& npm install && npm run dev`
3. Publique as regras: `firebase deploy --only firestore:rules` (ou cole `firestore.rules` no console).
4. Authentication → Configurações → Domínios autorizados: adicione o domínio de produção.
5. Backend (opcional): `cd backend && cp .env.example .env`, preencha com a service account
   (Console → Contas de serviço → Gerar chave; NUNCA commitar), `npm install && npm run dev`.
6. Testes da lógica: `cd frontend && npm test` (usa o test runner nativo do Node, sem dependências).
7. Deploy do frontend: `cd frontend && npm run build`, depois `firebase deploy --only hosting` na raiz.

## Celular
Layout responsivo, menu em gaveta, alvos de toque de 44px, campos com 16px (sem zoom no iOS), autocomplete correto,
login Google por redirecionamento em dispositivos móveis, Kanban com rolagem horizontal e arraste por toque longo.

## Plano gratuito (Spark)
- Sem Cloud Functions: hospede o backend em Render/Railway/Fly (plano grátis); o frontend vai no Firebase Hosting.
- Login por SMS exige plano Blaze, por isso não foi usado.
- Cloud Storage pode exigir plano Blaze em projetos novos; por isso não há upload de foto (usa a foto da conta Google).
- Os dados são lidos com listeners em tempo real filtrados por `ownerId`. Para muitos usuários/dados, acompanhe
  as cotas de leitura do Firestore e considere paginação.

## Revisão de segurança
Feito:
- Regras do Firestore: cada documento tem `ownerId`; leitura, edição e exclusão só pelo dono; o dono não pode ser trocado;
  perfil só aceita campos conhecidos; feedback só pode ser criado, com limites de tamanho; limite de campos por documento.
- API: token Firebase verificado em cada rota protegida, validação com Zod, Helmet, CORS restrito, limite de requisições,
  erros sem detalhes internos.
- Segredos só em `.env` (ignorado pelo git); as chaves web do Firebase são públicas por natureza.
- Links em notas só aceitam http(s) e abrem com `noopener noreferrer`; React escapa todo o texto exibido.
Recomendado antes de lançar:
- Ativar **Firebase App Check** (reCAPTCHA) para reduzir abuso das chaves públicas.
- Definir orçamento/alertas de uso no Console e testar as regras com o Emulator Suite (`firebase emulators:start`).
- Rodar `npm audit` e manter dependências atualizadas.

## Limitações conhecidas
- Cartões do Kanban mudam de coluna, mas não são reordenados dentro da coluna.
- Linha do tempo sem dependências entre tarefas; sem fases.
- Editor de notas é texto com formatação simples (não visual).
- Notificações só no app (sino); sem e-mail/push.
- Idioma: apenas português. Foto de perfil própria: não.
- Código não foi executado em navegador durante o desenvolvimento; apenas a lógica pura tem testes automatizados.
