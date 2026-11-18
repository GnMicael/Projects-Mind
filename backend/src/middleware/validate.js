import { HttpError } from '../utils/httpError.js';
export const validate = (schema) => (req, _res, next) => {
  const r = schema.safeParse(req.body);
  if (!r.success) return next(new HttpError(400, r.error.issues.map((i) => i.message).join(' ')));
  req.body = r.data; next();
};
