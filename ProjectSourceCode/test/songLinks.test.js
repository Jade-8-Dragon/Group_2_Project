const test = require('node:test');
const assert = require('node:assert/strict');
const { validateSongLinks, profileWithSongs } = require('../src/songLinks');

test('song links use canonical track and player URLs for each provider', () => {
  const { songs } = validateSongLinks([
    'https://open.spotify.com/intl-en/track/0Lr4kGOYn9l83EjuK6cZFQ?si=shared',
    'https://m.soundcloud.com/artist/my-track?utm_source=clipboard',
    'https://youtu.be/M7lc1UVf-VE?si=shared',
  ]);
  assert.deepEqual(songs, [
    {
      provider: 'Spotify',
      url: 'https://open.spotify.com/track/0Lr4kGOYn9l83EjuK6cZFQ',
      embedUrl: 'https://open.spotify.com/embed/track/0Lr4kGOYn9l83EjuK6cZFQ',
    },
    {
      provider: 'SoundCloud',
      url: 'https://soundcloud.com/artist/my-track',
      embedUrl: 'https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fartist%2Fmy-track&auto_play=false',
    },
    {
      provider: 'YouTube',
      url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      embedUrl: 'https://www.youtube.com/embed/M7lc1UVf-VE',
    },
  ]);
});

test('editing and reading a profile preserves empty song slots', () => {
  const result = validateSongLinks([' ', 'https://music.youtube.com/watch?v=M7lc1UVf-VE', null]);
  assert.equal(result.songs[0], null);
  assert.equal(result.songs[2], null);
  assert.deepEqual(profileWithSongs({
    username: 'musician',
    song_links: result.songs.map(song => song?.url ?? null),
  }), { username: 'musician', songs: result.songs });
  assert.deepEqual(profileWithSongs({ song_links: null }), { songs: [] });
  assert.deepEqual(validateSongLinks([]), { songs: [] });
});

test('invalid song links identify the bad slot and never return an embed', () => {
  for (const link of [
    '<iframe src="https://www.youtube.com/embed/M7lc1UVf-VE"></iframe>',
    'https://www.youtube.com.example.org/watch?v=M7lc1UVf-VE',
    'https://www.youtube.com@elsewhere.example/watch?v=M7lc1UVf-VE',
    'https://www.youtube.com/watch?v=too-short',
    'https://open.spotify.com/playlist/0Lr4kGOYn9l83EjuK6cZFQ',
    'https://soundcloud.com/artist/sets/playlist',
    123,
  ]) {
    assert.match(validateSongLinks(['', link]).error, /^Song 2 /);
  }
  assert.match(validateSongLinks(['', '', '', '']).error, /up to three/);
});
