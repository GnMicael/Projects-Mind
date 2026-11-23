# Project Mind

Plataforma de organização de projetos: React + Vite + Tailwind, Node/Express e Firebase (plano gratuito).

## O que existe (Fases 1 a 6)
- **Público:** home, cadastro, login (e-mail/senha e Google), recuperação de senha.
- **Onboarding** de 6 etapas que personaliza as sugestões do dashboard (nada fica bloqueado).
- **Projetos:** criar (rápido ou completo), editar, duplicar, favoritar, arquivar, excluir, busca, filtros, grade/lista.
- **Espaço de trabalho do projeto:** visão geral, quadro Kanban (arrastar e soltar, colunas personalizáveis), tarefas
  (subtarefas, checklist), calendário, linha do tempo, stakeholders (matriz poder × interesse), riscos (matriz 5×5),
  metas e marcos, notas, relatórios com gráficos.
- **Barra superior:** busca global (Ctrl/⌘ K), breadcrumbs, menu rápido "Novo" (projeto, tarefa, evento, ideia), sino e menu do perfil.
- **Globais:** dashboard com dados reais, tarefas, calendário, brainstorm (ideia vira tarefa ou projeto), planejamento, modelos de projeto.
- **Configurações:** nome, redefinição de senha, tema (escuro/claro/sistema), cor de destaque, formato de data,
  notificações no sino, suporte (contatos configuráveis) e feedback salvo no Firestore.
- **API Express** modular (`backend/`): health e `/users/me`, com verificação de token, validação e limite de requisições.
  O frontend usa o Firestore direto, protegido pelas regras; a API é a base para operações que precisem de servidor.

## Receber o feedback por e-mail (EmailJS)
O formulário de feedback (Configurações → Suporte) salva no Firestore e, se o EmailJS estiver configurado, também envia um e-mail para você.
1. Crie uma conta em emailjs.com → **Email Services → Add New Service** (Gmail, Outlook…) e conecte o seu e-mail. Copie o **Service ID**.
2. **Email Templates → Create New Template**:
   - **To Email:** escreva o SEU e-mail fixo (não use variável aqui; assim ninguém consegue usar sua conta para escrever a terceiros).
   - **Reply To:** `{{reply_to}}`
   - **Subject:** `[Project Mind] {{category}}: {{subject}}`
   - **Content:**
     ```
     Tipo: {{category}}
     Assunto: {{subject}}
     De: {{from_name}} <{{from_email}}>
     Projeto relacionado: {{project_context}}
     Enviado em: {{sent_at}}
     ID do usuário: {{user_id}}

     {{message}}
     ```
   Copie o **Template ID**.
3. **Account → General:** copie a **Public Key**.
4. Preencha no `frontend/.env`: `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY` e reinicie o `npm run dev`.
5. Em **Account → Security** do EmailJS, restrinja os domínios permitidos ao seu site (a chave pública fica visível no navegador).
6. Teste enviando um feedback pelo app. O plano gratuito tem limite mensal de e-mails (confira o valor atual no site do EmailJS).
O app só deixa enviar um feedback a cada 30 segundos por navegador. Se o EmailJS falhar, o feedback continua salvo no Firestore.

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

## Instalar como app (PWA)
O site é instalável: Android/Chrome (menu ⋮ → Instalar app, ou o botão em Configurações / menu do perfil) e iPhone/Safari
(Compartilhar → Adicionar à Tela de Início). O service worker só é registrado no build de produção (`npm run build`).
Os dados continuam vindo do Firebase; sem internet o app abre, mas não carrega dados novos.

## Celular
Layout responsivo, menu em gaveta, alvos de toque de 44px, campos com 16px (sem zoom no iOS), autocomplete correto,
login Google por redirecionamento em dispositivos móveis, Kanban com rolagem horizontal e arraste por toque longo.

## Plano gratuito (Spark)
- Sem Cloud Functions: hospede o backend em Render/Railway/Fly (plano grátis); o frontend vai no Firebase Hosting.
- Login por SMS exige plano Blaze, por isso não foi usado.
- Cloud Storage pode exigir plano Blaze em projetos novos; por isso não há upload de foto (usa a foto da conta Google).
- Os dados são lidos com listeners em tempo real filtrados por `ownerId`, com uma única assinatura compartilhada por coleção. Para muitos usuários/dados, acompanhe
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
- Tarefas não têm responsáveis (não há contas compartilhadas entre usuários).
- Linha do tempo sem dependências entre tarefas; sem fases.
- Dashboard e abas do projeto não são personalizáveis.
- Editor de notas é texto com formatação simples (não visual).
- Notificações só no app (sino); sem e-mail/push.
- Idioma: apenas português. Foto de perfil própria: não.
- Código não foi executado em navegador durante o desenvolvimento; apenas a lógica pura tem testes automatizados.
