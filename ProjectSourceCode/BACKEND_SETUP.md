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
5. Run `node --test test/validation.test.js test/musicians.test.js` to check input validation and musician queries.

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
| `GET /api/profile` | Current account profile and saved songs (JSON) |
| `PUT /api/profile/songs` | Replace the signed-in musician's song links |
| `GET /api/me` | Current account ID, name, and role (JSON) |
| `GET /api/musicians?search=jazz` | List up to 50 musicians, optionally searched by name/stage/location |
| `GET /api/musicians/:id` | One musician's public profile data (JSON) |
| `GET /musicians/:id` | Serve existing musician profile page |

The `/api/*` routes require login and return HTTP 401 JSON when unauthenticated.
Profiles are read from the `users` and `musician_profiles` tables using a `LEFT JOIN`,
so sample musician users appear even before their optional profile rows are filled in.
The musician directory and visitor profile endpoints omit passwords and email addresses.

Session storage uses the in-memory default, suitable for local coursework development,
not a production server. A production deployment needs a persistent session store.

**Note about SQL:** `src/init_data/create.sql` runs only when the Postgres Docker
volume is first created. New SQL changes do not apply automatically to existing volumes.

## Discover header and musician song links

Discover loads the existing Reserve Music logo from `/img/reserve-music-logo.png`. The
logo sits at the top left. The About button sits at the top right and opens a short description.
Profile is available in the bottom navigation. The Discover script is served from
`src/resources/js/discover.js` so visitors can search for musicians and open their profiles.

### Add or remove songs

1. Sign in with a musician account and open **Profile**.
2. Expand **Edit song links** and fill in up to three slots. Each slot accepts a Spotify
   track URL, a full SoundCloud track URL such as `https://soundcloud.com/artist/track`,
   or a YouTube video URL, including `youtu.be` links.
3. Click **Save songs**. To remove a song, clear its field and save again.
4. Open the musician's profile from **Discover → View Profile** to see the visitor view.
   Each saved song has a tab, an embedded player, and a link to the original service.
   Switching tabs replaces the active player.

### How saving works

- [Profile page](pages/musicianProfile_012-2.html) and
  [profile script](src/resources/js/musicians_profile.js) handle the editor and players.
  The owner page loads `GET /api/profile`. The visitor page loads `GET /api/musicians/:id`
  for the musician in the URL and leaves the editor hidden.
- [The API](src/app.js) accepts `PUT /api/profile/songs` with a JSON `links` array of up
  to three entries. An empty string or `null` leaves a slot empty. The route saves links
  for the musician in the current session and leaves other profile fields intact. It
  returns HTTP 401 without a session, 403 for customer accounts, and 400 for invalid links.
- [Link validation](src/songLinks.js) checks the provider and track or video URL, strips
  sharing parameters, and builds player URLs. Both profile endpoints return a `songs` array
  with the provider name, canonical URL, and player URL for each occupied slot.
- [The database migration](src/init_data/profile_songs.sql) adds `musician_profiles.song_links`
  with an empty default and a three-link limit. Existing profile data stays in place.

### Apply the migration to an existing Docker database

New databases apply the migration during initialization. For an existing local database,
run the following from `ProjectSourceCode` with the database container running.

```powershell
docker compose exec -T db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/profile_songs.sql'
docker compose restart web
```

The migration was applied to the local Docker database during development. That database
was also missing the merged branch's email verification and password reset schema. The
missing column and token tables were added using the definitions in `src/init_data/create.sql`.

### Verification

Run the focused song-link tests from `ProjectSourceCode`.

```powershell
node --test test/songLinks.test.js
```

All 12 tests in the song-link, musician, validation, and configuration suites passed.
The running app was tested with temporary musician and customer accounts against local
PostgreSQL. Chrome checks covered saving all three providers, switching players, reloading,
and reaching the read-only profile from Discover. API checks also covered clearing slots,
rejecting invalid links, and denying edits without a musician session. The Chrome check
verified player URLs and left third-party streaming untested. The broader Mocha suite was
blocked by pre-existing merge markers in `test/server.spec.js`.

### AI assistance

OpenAI Codex implemented the Discover header and song-link changes, applied the local
database updates, and ran the verification described above.
