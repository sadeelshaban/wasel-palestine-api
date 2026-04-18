import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AppModule } from './app.module';
import { AppService } from './app.service';

dotenv.config({ path: '.env', override: true });

const TAG_ORDER = ['Authentication', 'Users', 'Admin', 'Health'];

function countOperations(doc: OpenAPIObject): number {
  let n = 0;
  for (const pathItem of Object.values(doc.paths ?? {})) {
    if (!pathItem) continue;
    for (const k of Object.keys(pathItem)) {
      if (
        ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(
          k,
        )
      ) {
        n += 1;
      }
    }
  }
  return n;
}

function sortTags(doc: OpenAPIObject) {
  if (!doc.tags?.length) return;
  doc.tags.sort(
    (a, b) =>
      (TAG_ORDER.indexOf(a.name) === -1 ? 999 : TAG_ORDER.indexOf(a.name)) -
      (TAG_ORDER.indexOf(b.name) === -1 ? 999 : TAG_ORDER.indexOf(b.name)),
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  app.enableCors();
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
    /* optional theme file */
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Wasel Palestine - API Reference')
    .setDescription(
      [
        'REST API for Wasel Palestine.',
        '',
        'Import this spec into API Dog or similar tools:',
        '- `GET /openapi.json`',
        '- `GET /api-docs-json` (Swagger default)',
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
  const opCount = countOperations(document);
  if (document.info) {
    document.info.description = [
      document.info.description,
      '',
      '---',
      '',
      `**${opCount} endpoints** · Base path \`/api/v1\``,
      '',
        '**Access levels** (see each operation): `public` · `authenticated` (Bearer JWT) · `admin` (role ADMIN).',
        '',
        '`GET /health` is not under `/api/v1` (reserved for probes).',
    ].join('\n');
  }

  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'Wasel Palestine - API Reference',
    customCss,
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      docExpansion: 'list',
      operationsSorter: 'method',
    },
  });

  const httpApp = app.getHttpAdapter().getInstance();
  const appService = app.get(AppService);

  // Keep the GUI reachable on root paths, independent of /api/v1 prefix.
  httpApp.get('/', (_req: unknown, res: Response) => {
    res.redirect('/gui');
  });
  httpApp.get('/gui', (_req: unknown, res: Response) => {
    res.type('html').send(appService.getGuiHtml());
  });

  httpApp.get('/openapi.json', (_req: unknown, res: Response) => {
    res.json(document);
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
