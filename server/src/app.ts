import express from 'express';
import { json } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import mainRouter from './routes/index.js';
import { globalErrorHandler } from './middlewares/errors/globalError.middleware.js';

const app = express();

/**
 * Middlewares Globais do Express.
 */

// 1. JSON body parser
app.use(json());

// 2. CORS — permite requisições do frontend em dev e do domínio de produção
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (ex: Postman, curl) e origens permitidas
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS bloqueado para a origem: ${origin}`));
      }
    },
    credentials: true, // necessário para Authorization header e cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Cookie parser — sem esta linha req.cookies é objeto vazio
app.use(cookieParser());

// 4. Roteador principal da API
app.use('/api', mainRouter);

// 5. Rota de health check
app.get('/', (_req, res) => {
  res.json({
    message: 'API Valle Leads System — TypeScript + Express + Prisma funcionando!',
  });
});

// 6. Middleware global de erros (deve ser o último middleware)
app.use(globalErrorHandler);

export default app;
