import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const databaseDir = path.join(root, '.pgdata');
const initialized = existsSync(path.join(databaseDir, 'PG_VERSION'));

const pg = new EmbeddedPostgres({
  databaseDir,
  user: 'postgres',
  password: 'postgres',
  port: 5432,
  persistent: true,
  initdbFlags: ['--encoding=UTF8', '--locale=C', '--lc-collate=C', '--lc-ctype=C'],
});

if (!initialized) {
  console.log('Initializing PostgreSQL data directory...');
  await pg.initialise();
}

await pg.start();

try {
  await pg.createDatabase('app_db');
  console.log('Created database app_db');
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (!/already exists/i.test(message)) {
    console.warn('createDatabase:', message);
  }
}

console.log('PostgreSQL is running at postgresql://postgres:postgres@127.0.0.1:5432/app_db');
console.log('Keep this terminal open. Press Ctrl+C to stop.');

const shutdown = async () => {
  await pg.stop();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
