'use strict';

const { existsSync } = require('fs');
const { join } = require('path');
const { spawn } = require('child_process');

const root = join(__dirname, '..');
const candidates = [
  join(root, 'dist', 'main.js'),
  join(root, 'dist', 'src', 'main.js'),
];

const entry = candidates.find((p) => existsSync(p));

if (!entry) {
  console.error(
    'No compiled entry found. Expected one of:\n  ' +
      candidates.join('\n  ') +
      '\nRun: npm run build',
  );
  process.exit(1);
}

const child = spawn(process.execPath, [entry], {
  stdio: 'inherit',
  cwd: root,
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
