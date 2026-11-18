import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfile } from '../validators/user.js';
import { getMe, updateMe } from '../controllers/user.js';

const r = Router();
r.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
r.get('/users/me', requireAuth, getMe);
r.patch('/users/me', requireAuth, validate(updateProfile), updateMe);
export default r;
