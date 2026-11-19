const MAX_SONGS = 3;
const MAX_LINK_LENGTH = 2048;

function describeSongLink(value) {
  if (typeof value !== 'string' || value.length > MAX_LINK_LENGTH) return null;
  let link;
  try {
    link = new URL(value.trim());
  } catch {
    return null;
  }
  if (!['https:', 'http:'].includes(link.protocol) || link.username || link.password || link.port) {
    return null;
  }

  const { hostname, pathname } = link;
  if (hostname === 'open.spotify.com') {
    const track = pathname.match(/^\/(?:intl-[a-z-]+\/)?(?:embed\/)?track\/([a-zA-Z0-9]{22})\/?$/i)?.[1];
    if (!track) return null;
    return {
      provider: 'Spotify',
      url: 'https://open.spotify.com/track/' + track,
      embedUrl: 'https://open.spotify.com/embed/track/' + track,
    };
  }

  if (['soundcloud.com', 'www.soundcloud.com', 'm.soundcloud.com'].includes(hostname)) {
    const track = pathname.match(/^\/([a-z0-9_-]+\/[a-z0-9_-]+)\/?$/i)?.[1];
    if (!track) return null;
    const url = 'https://soundcloud.com/' + track;
    return {
      provider: 'SoundCloud',
      url,
      embedUrl: 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(url) + '&auto_play=false',
    };
  }

  let video;
  if (hostname === 'youtu.be') {
    video = pathname.match(/^\/([\w-]+)\/?$/)?.[1];
  } else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(hostname)) {
    video = pathname === '/watch'
      ? link.searchParams.get('v')
      : pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)\/?$/)?.[1];
  }
  if (!video || !/^[\w-]{11}$/.test(video)) return null;
  return {
    provider: 'YouTube',
    url: 'https://www.youtube.com/watch?v=' + video,
    embedUrl: 'https://www.youtube.com/embed/' + video,
  };
}

function validateSongLinks(links) {
  if (!Array.isArray(links) || links.length > MAX_SONGS) {
    return { error: 'Enter up to three song links.' };
  }

  const songs = [];
  for (const [index, link] of links.entries()) {
    if (link === null || (typeof link === 'string' && link.length <= MAX_LINK_LENGTH && !link.trim())) {
      songs.push(null);
      continue;
    }
    const song = describeSongLink(link);
    if (!song) {
      return {
        error: 'Song ' + (index + 1) + ' needs a Spotify track, full SoundCloud track, or YouTube video link.',
      };
    }
    songs.push(song);
  }
  return { songs };
}

function profileWithSongs(profile) {
  const { song_links, ...details } = profile;
  return { ...details, songs: (song_links || []).map(describeSongLink) };
}

module.exports = { validateSongLinks, profileWithSongs };
