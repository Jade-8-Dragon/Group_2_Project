const test = require('node:test');
const assert = require('node:assert/strict');
const { searchTerm, musicianId, listMusicians, findMusician } = require('../src/musicians');

test('search input is trimmed and limited', () => {
  assert.equal(searchTerm('  jazz  '), 'jazz');
  assert.equal(searchTerm('a'.repeat(200)).length, 100);
  assert.equal(searchTerm({ malicious: true }), '');
});

test('musician IDs only accept safe positive integers', () => {
  assert.equal(musicianId('42'), 42);
  for (const value of ['0', '-1', '1; DROP TABLE users', 'abc', '1.3', '9007199254740992']) {
    assert.equal(musicianId(value), null);
  }
});

test('directory lookup uses parameterized SQL and musician accounts only', async () => {
  let observed;
  const db = { any: async (sql, params) => {
    observed = { sql, params };
    return [{ user_id: 3, stage_name: 'Sarah' }];
  } };
  const result = await listMusicians(db, "rock' OR 1=1 --");
  assert.equal(result.length, 1);
  assert.match(observed.sql, /u\.user_type = 'musician'/);
  assert.match(observed.sql, /LIMIT 50/);
  assert.doesNotMatch(observed.sql, /OR 1=1/);
  assert.deepEqual(observed.params, ["rock' OR 1=1 --", "%rock' OR 1=1 --%"]);
  assert.doesNotMatch(observed.sql, /password_hash/);
});

test('profile lookup uses a bound ID and handles missing musicians', async () => {
  const db = { oneOrNone: async (sql, params) => {
    assert.match(sql, /u\.user_type = 'musician'/);
    assert.deepEqual(params, [5]);
    return null;
  } };
  assert.equal(await findMusician(db, 5), null);
});
