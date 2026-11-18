import { adminAuth } from '../config/firebase.js';
import { HttpError } from '../utils/httpError.js';

export async function requireAuth(req, _res, next) {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer /, '');
    if (!token) throw new HttpError(401, 'Autenticação necessária.');
    req.user = await adminAuth.verifyIdToken(token);
    next();
  } catch (e) { next(e instanceof HttpError ? e : new HttpError(401, 'Token inválido ou expirado.')); }
}
