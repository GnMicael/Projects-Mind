import { adminDb } from '../config/firebase.js';
import { HttpError } from '../utils/httpError.js';

export async function getMe(req, res, next) {
  try {
    const snap = await adminDb.doc(`users/${req.user.uid}`).get();
    if (!snap.exists) throw new HttpError(404, 'Perfil não encontrado.');
    res.json({ success: true, data: snap.data() });
  } catch (e) { next(e); }
}
export async function updateMe(req, res, next) {
  try {
    await adminDb.doc(`users/${req.user.uid}`).set(req.body, { merge: true });
    res.json({ success: true, data: req.body });
  } catch (e) { next(e); }
}
