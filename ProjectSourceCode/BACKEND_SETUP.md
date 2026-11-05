# Express / Node.js backend notes

This project runs from the `ProjectSourceCode` directory. The backend is in `src/index.js`,
`src/app.js`, `src/validation.js`, and `src/musicians.js`.

## Running it

1. Run `npm install` from `ProjectSourceCode` (needed before the bind-mounted Docker web container starts).
2. Copy `.env.example` to `.env`. Replace `SESSION_SECRET` with a random, private value.
3. For Docker, keep `POSTGRES_HOST=db` and run `docker compose up` from `ProjectSourceCode`.
   The database schema and sample rows are initialized on the first launch with an empty volume.
4. Browse to `http://localhost:3000/register` and create a new account. The sample accounts in
   `insert.sql` have placeholder passwords and cannot be used to log in.
5. Run `npm test` to check the input validation and musician query helpers.

To run only Node on your computer with a locally running Postgres server, set
`POSTGRES_HOST=localhost` in `.env` and run `npm start`.

## Routes

| Route | Description |
| --- | --- |
| `GET /health` | Simple server health check |
| `GET /register`, `POST /register` | Registration page and account creation |
| `GET /login`, `POST /login` | Login page and session creation |
| `GET /logout` | End session and show logout page |
| `GET /discover` | Authenticated home/discover page |
| `GET /profile` | Authenticated account profile page |
| `GET /api/me` | Current account ID, name, and role (JSON) |
| `GET /api/musicians?search=jazz` | List up to 50 musicians, optionally searched by name/stage/location |
| `GET /api/musicians/:id` | One musician's public profile data (JSON) |
| `GET /musicians/:id` | Serve existing musician profile page |

The `/api/*` routes require login and return HTTP 401 JSON when unauthenticated.
Profiles are read from the `users` and `musician_profiles` tables using a `LEFT JOIN`,
so sample musician users appear even before their optional profile rows are filled in.
The API excludes passwords and user email addresses.

The current HTML pages are still starter designs; the musician directory API is ready for
whichever teammate is building the Discover page to call with `fetch()`.
Session storage uses the in-memory default, suitable for local coursework development,
not a production server. A production deployment needs a persistent session store.

**Note about SQL:** `src/init_data/create.sql` runs only when the Postgres Docker
volume is first created. New SQL changes do not apply automatically to existing volumes.
