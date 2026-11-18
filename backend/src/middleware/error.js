export function notFound(_req, res) { res.status(404).json({ success: false, error: 'Rota não encontrada.' }); }
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, error: status >= 500 ? 'Erro interno.' : err.message });
}
