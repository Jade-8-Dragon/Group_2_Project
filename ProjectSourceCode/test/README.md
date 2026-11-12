# Lab 10 tests

The Mocha suite in `test/server.spec.js` runs against its own Postgres database in Docker, separate from the dev database. Run every command below from `ProjectSourceCode/`.

## Running the tests

1. Create the local test settings (one time). `.env.test` is gitignored; only `.env.test.example` is committed.

   ```sh
   cp .env.test.example .env.test
   ```

2. Install dependencies into the test container (one time, and again after `package.json` changes):

   ```sh
   docker compose -p lab10-tests -f docker-compose.test.yaml run --rm --no-deps tests npm ci
   ```

3. Run the suite. It starts `db-test`, waits for it to be healthy, runs `npm test`, and exits with the test result:

   ```sh
   docker compose -p lab10-tests -f docker-compose.test.yaml up --abort-on-container-exit --exit-code-from tests
   ```

   Run it again straight away to check repeatability. No reset is needed between runs.

4. Reset the test stack when you want a fresh database (this only touches the `lab10-tests` project, never the dev database):

   ```sh
   docker compose -p lab10-tests -f docker-compose.test.yaml down --volumes
   ```

The tests refuse to run anywhere else. `test/server.spec.js` stops unless `NODE_ENV=test` and `POSTGRES_HOST=db-test`, and `src/db.js` refuses `NODE_ENV=test` unless the database name ends in `_test` (ours is `project_test`).

## What's tested

| Test | Kind | What it checks |
|---|---|---|
| `GET /welcome` | API | 200 with `{ "status": "success", "message": "Welcome!" }` |
| Registration validation | Unit | `validateRegistration` returns an error for a missing password, with no HTTP or database |
| `POST /register` valid user | Integration (positive) | 302 to `/login`; exactly one `users` row with the right email and `user_type`; the password is stored as a bcrypt hash that matches |
| `POST /register` missing password | Integration (negative) | 302 to `/register?error=...`; no `users` row created |
| `GET /api/profile` after login | Integration (positive, extra credit) | Logs in through `POST /login` with a `chai.request.agent`; 200 JSON with the user's `username`, `email` and `user_type`, and no `password_hash` |
| `GET /api/profile` without a session | Integration (negative, extra credit) | 401 with `{ "error": "Please log in." }` |

`validateRegistration` (in `src/validation.js`) is the same function the `POST /register` route uses to reject bad input, so the unit test covers the real route's rule.

The `*.test.js` files in this folder use Node's built-in test runner and aren't part of `npm test`. Run them with `node --test test/*.test.js` if you want them.

## Route contracts

### `POST /register`

- **Request:** a form post (`application/x-www-form-urlencoded`, what the register page sends) or JSON, with these fields:

  | Field | Rule |
  |---|---|
  | `username` | 1–50 characters after trimming spaces |
  | `email` | a valid email address, up to 255 characters; stored lowercase |
  | `password` | 8–72 bytes, with at least one number and one special character |
  | `role` | `customer` or `musician` |

- **Success:** `302` redirect to `/login`, and one new `users` row: `username`, `email`, `password_hash` (bcrypt, cost 10, never the plain password) and `user_type` (the `role`).
- **Invalid input:** `302` redirect to `/register?error=<message>`, where the message names the field that failed, for example `Password must be 8-72 bytes and include a number and a special character.` No row is created.
- **Username or email already taken:** `302` redirect to `/register?error=exists`.
- **Database error:** `302` redirect to `/register?error=server`.

The route redirects instead of returning `400` because the register page is a plain HTML form; the redirect sends the user back to the form. The tests use `.redirects(0)` so they check the redirect itself.

### `GET /api/profile`

- **Logged in:** `200` JSON with `username`, `email`, `user_type`, `avatar_url`, and, for musicians, `stage_name`, `bio`, `location` and `starting_price`. It never includes `password_hash`.
- **Not logged in:** `401` with `{ "error": "Please log in." }`.

## Test data and cleanup

- Every `describe` block makes a random username like `lab10_<16 hex characters>`, so test users never collide with real data or with each other.
- Each test deletes its user in `beforeEach` **and** `afterEach`, so a test that crashes halfway doesn't leave a row behind for the next run.
- The `/api/profile` tests insert their user directly with a bcrypt hash, log in with a fresh `chai.request.agent(app)` (which keeps the session cookie), and close the agent after each test.
- The database pool closes in a top-level `after()` hook, so Mocha exits by itself without `--exit`.
- The seed data in `src/init_data/` loads only when the test database volume is new. The tests don't depend on it.
