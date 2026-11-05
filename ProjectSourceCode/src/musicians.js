// Database queries for the musician directory. No passwords or emails are returned.
function searchTerm(value) {
  return typeof value === 'string' ? value.trim().slice(0, 100) : '';
}

function musicianId(value) {
  if (typeof value !== 'string' || !/^[1-9][0-9]*$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

async function listMusicians(db, query) {
  const search = searchTerm(query);
  return db.any(`
    SELECT u.user_id, u.username,
           COALESCE(mp.stage_name, u.username) AS stage_name,
           mp.bio, mp.location, mp.starting_price
    FROM users AS u
    LEFT JOIN musician_profiles AS mp ON mp.user_id = u.user_id
    WHERE u.user_type = 'musician'
      AND ($1 = '' OR u.username ILIKE $2 OR mp.stage_name ILIKE $2 OR mp.location ILIKE $2)
    ORDER BY u.username ASC
    LIMIT 50
  `, [search, `%${search}%`]);
}

async function findMusician(db, id) {
  return db.oneOrNone(`
    SELECT u.user_id, u.username,
           COALESCE(mp.stage_name, u.username) AS stage_name,
           mp.bio, mp.location, mp.starting_price
    FROM users AS u
    LEFT JOIN musician_profiles AS mp ON mp.user_id = u.user_id
    WHERE u.user_type = 'musician' AND u.user_id = $1
  `, [id]);
}

module.exports = { searchTerm, musicianId, listMusicians, findMusician };
