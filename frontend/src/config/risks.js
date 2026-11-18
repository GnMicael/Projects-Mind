export const LEVEL_COLOR = { Baixo: '#22C55E', Médio: '#FBBF24', Alto: '#F97316', Crítico: '#EF4444' };
export const LEVELS = Object.keys(LEVEL_COLOR);
export const levelOf = (p, i) => { const s = p * i; return s >= 15 ? 'Crítico' : s >= 10 ? 'Alto' : s >= 5 ? 'Médio' : 'Baixo'; };
