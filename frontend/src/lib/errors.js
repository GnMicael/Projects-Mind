// Traduz erros do Firebase em mensagens úteis (e mostra o código, para facilitar o diagnóstico).
export function describeError(e) {
  const code = String(e?.code || '');
  const msg = String(e?.message || '');
  const tag = code ? ` (${code})` : '';
  if (code.includes('permission-denied')) return `Sem permissão no Firestore${tag}. Publique as regras (firebase deploy --only firestore:rules) e confira se você está logado.`;
  if (code.includes('unauthenticated')) return `Sua sessão expirou${tag}. Saia e entre de novo.`;
  if (code.includes('not-found') || code.includes('failed-precondition')) return `O banco Firestore não foi encontrado ou não está pronto${tag}. Crie o banco no console do Firebase e ative a API Cloud Firestore.`;
  if (code.includes('unavailable') || code.includes('deadline-exceeded') || code.includes('network')) return `Sem conexão com o Firebase${tag}. Verifique a internet, VPN ou antivírus.`;
  if (code.includes('invalid-argument') || /undefined|unsupported field/i.test(msg)) return `O Firestore recusou os dados${tag}: ${msg}`;
  return `Erro inesperado${tag}: ${msg || 'sem detalhes'}`;
}
