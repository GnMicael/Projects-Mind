import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN || '').split(',') }));
app.use(express.json({ limit: '100kb' }));
app.use(morgan('tiny'));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 120 }), routes);
app.use(notFound);
app.use(errorHandler);
export default app;
