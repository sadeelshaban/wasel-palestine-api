import { resolve } from 'node:path';
import dotenv from 'dotenv';

// Load repo `.env` so `DATABASE_URL` / `JWT_SECRET` exist when Jest runs e2e (same as `npm run db:seed`).
dotenv.config({ path: resolve(__dirname, '../.env'), override: false });
