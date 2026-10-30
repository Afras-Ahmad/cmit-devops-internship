const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('frontend build configuration and source are present', () => {
  const root = __dirname;
  assert.ok(fs.existsSync(path.join(root, '..', 'webpack.config.js')));
  assert.ok(fs.existsSync(path.join(root, '..', 'src')));
  const pkg = JSON.parse(fs.readFileSync(path.join(root, '..', 'package.json'), 'utf8'));
  assert.equal(pkg.scripts.build, 'webpack --config=webpack.config.js');
});
