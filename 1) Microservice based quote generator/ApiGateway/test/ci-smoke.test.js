const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { test } = require('node:test');
const assert = require('node:assert/strict');

test('API Gateway exposes status and 404 endpoints', async (t) => {
  const child = spawn(process.execPath, ['index.js'], {
    env: { ...process.env, QUOTES_API: 'http://127.0.0.1:9' },
    stdio: 'ignore',
  });
  t.after(() => child.kill('SIGTERM'));
  let response;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      response = await fetch('http://127.0.0.1:3000/api/status');
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  assert.ok(response, 'gateway should start and accept connections');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
  const missing = await fetch('http://127.0.0.1:3000/not-found');
  assert.equal(missing.status, 404);
});
