export const STATUS = ['Planejamento', 'Não iniciado', 'Em andamento', 'Em espera', 'Concluído', 'Arquivado'];
export const PRIORITY = ['Baixa', 'Média', 'Alta', 'Urgente'];
export const TYPES = ['Trabalho', 'Estudos', 'Pessoal', 'Negócio', 'Hobby', 'Pesquisa', 'Outro'];
export const METHODS = ['Kanban', 'Lista de tarefas', 'Cronograma', 'Ágil / Scrum', 'Flexível'];
export const TEMPLATES = ['Em branco', 'Software', 'Estudos', 'Marketing', 'Evento', 'Pessoal'];
export const ACTIVE = ['Planejamento', 'Não iniciado', 'Em andamento', 'Em espera'];
export const DATE_FORMATS = [['dmy', 'DD/MM/AAAA'], ['mdy', 'MM/DD/AAAA'], ['ymd', 'AAAA-MM-DD']];

let FMT = (typeof localStorage !== 'undefined' && localStorage.getItem('pm-datefmt')) || 'dmy';
export const setDateFormat = (f) => { FMT = DATE_FORMATS.some(([k]) => k === f) ? f : 'dmy'; if (typeof localStorage !== 'undefined') localStorage.setItem('pm-datefmt', FMT); };

const pad = (n) => String(n).padStart(2, '0');
const out = (y, m, d) => (FMT === 'mdy' ? `${m}/${d}/${y}` : FMT === 'ymd' ? `${y}-${m}-${d}` : `${d}/${m}/${y}`);
export const fmtDate = (s) => { if (!s) return '—'; const [y, m, d] = s.slice(0, 10).split('-'); return out(y, m, d); };
export const fmtTs = (ts) => { if (!ts?.toDate) return '—'; const d = ts.toDate(); return out(d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())); };
// Datas locais (não UTC), para "hoje" não virar "amanhã" à noite no Brasil
export const addDays = (n = 0) => { const d = new Date(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
export const today = () => addDays(0);
