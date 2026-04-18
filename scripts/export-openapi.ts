/**
 * Build OpenAPI JSON without starting HTTP (requires DATABASE_URL and reachable PostgreSQL).
 * Usage: npm run export:openapi
 */
import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';
import { AppModule } from '../src/app.module';

const TAG_ORDER = ['Authentication', 'Users', 'Admin', 'Health'];

function sortTags(doc: OpenAPIObject) {
  if (!doc.tags?.length) return;
  doc.tags.sort(
    (a, b) =>
      (TAG_ORDER.indexOf(a.name) === -1 ? 999 : TAG_ORDER.indexOf(a.name)) -
      (TAG_ORDER.indexOf(b.name) === -1 ? 999 : TAG_ORDER.indexOf(b.name)),
  );
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Use .env or:');
    console.error(
      '  docker compose up -d db && npx prisma migrate deploy && npm run export:openapi',
    );
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule, { logger: ['error'] });
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  let customCss = '';
  try {
    customCss = readFileSync(
      join(process.cwd(), 'swagger', 'wasel-swagger.css'),
      'utf-8',
    );
  } catch {
    /* optional */
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Wasel Palestine - API Reference')
    .setDescription(
      [
        'REST API for Wasel Palestine.',
        '',
        'Import this file into API Dog:',
        '- File: `delivery/api-dog/openapi.json` (this export)',
        '- Or live: `GET /openapi.json` from a running server',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'Registration, login, tokens, password flows')
    .addTag('Users', 'Profiles and admin user management')
    .addTag('Admin', 'Audit and administration')
    .addTag('Health', 'Service status')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  sortTags(document);

  const outDir = join(process.cwd(), 'delivery', 'api-dog');
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, 'openapi.json');
  writeFileSync(outFile, JSON.stringify(document, null, 2), 'utf-8');
  void customCss;
  await app.close();
  console.log('Wrote', outFile);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
