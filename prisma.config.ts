import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

// Load .env when present (local dev). Docker Compose injects DATABASE_URL directly into process.env.
dotenv.config({ path: '.env', override: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Add it to .env locally, or pass it in the container environment.',
  );
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
  },
});
