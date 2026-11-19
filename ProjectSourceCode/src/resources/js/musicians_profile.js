// Musician profile page behavior. Loaded with `defer`, so the DOM is ready when this runs.

let currentBio = ''; // the real saved bio, not the "No bio yet." fallback

function setText(id, value, fallback) {
    document.getElementById(id).textContent = value || fallback;
}

// ---------- Songs ----------
const songHeader = document.getElementById('song-header');
const songTabs = document.getElementById('song-tabs');
const songPlayer = document.getElementById('song-player');
const songForm = document.getElementById('song-form');
const songInputs = Array.from(songForm.querySelectorAll('input'));
const songSave = document.getElementById('song-save');
const songStatus = document.getElementById('song-status');

function showSong(song, selected) {
    for (const button of songTabs.children) {
        button.classList.toggle('active', button === selected);
        button.setAttribute('aria-pressed', String(button === selected));
    }

    const frame = document.createElement('iframe');
    frame.title = selected.textContent + ' player';
    frame.src = song.embedUrl;
    frame.className = 'd-block w-100 border-0 rounded';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    frame.allowFullscreen = true;
    frame.loading = 'lazy';
    if (song.provider === 'YouTube') {
        frame.style.aspectRatio = '16 / 9';
        frame.style.minHeight = '200px';
    } else {
        frame.height = song.provider === 'Spotify' ? '152' : '166';
    }

    const link = document.createElement('a');
    link.className = 'd-inline-block small mt-2';
    link.href = song.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Open on ' + song.provider;
    songPlayer.replaceChildren(frame, link);
}

function renderSongs(songs) {
    songTabs.replaceChildren();
    let firstSong;
    for (const [index, song] of songs.entries()) {
        if (!song) continue;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'nav-link';
        button.textContent = 'Song ' + (index + 1) + ' · ' + song.provider;
        button.addEventListener('click', () => {
            if (button.getAttribute('aria-pressed') !== 'true') showSong(song, button);
        });
        songTabs.append(button);
        firstSong ??= song;
    }
    songHeader.hidden = !firstSong;
    if (firstSong) {
        showSong(firstSong, songTabs.firstElementChild);
    } else {
        songPlayer.textContent = 'No songs added yet.';
    }

    songInputs.forEach((input, index) => {
        input.value = songs[index]?.url || '';
    });
}

async function saveSongs(event) {
    event.preventDefault();
    const links = songInputs.map(input => input.value.trim());
    songSave.disabled = true;
    songInputs.forEach(input => { input.readOnly = true; });
    songStatus.textContent = '';
    songStatus.classList.remove('text-danger');
    try {
        const res = await fetch('/api/profile/songs', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ links }),
        });
        if (res.status === 401) { window.location.href = '/login'; return; }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not save song links.');
        renderSongs(data.songs);
        songStatus.textContent = 'Song links saved.';
    } catch (error) {
        songStatus.classList.add('text-danger');
        songStatus.textContent = error.message;
    } finally {
        songSave.disabled = false;
        songInputs.forEach(input => { input.readOnly = false; });
    }
}

// ---------- Profile ----------
const viewingOwnProfile = /^\/profile\/?$/i.test(window.location.pathname);

async function loadProfile() {
    try {
        const profileUrl = viewingOwnProfile ? '/api/profile' : '/api' + window.location.pathname;
        const res = await fetch(profileUrl);
        if (res.status === 401) {
            window.location.href = '/login';
            return;
        }
        if (!res.ok) throw new Error(res.status === 404 ? 'Musician not found.' : 'Could not load profile.');
        const p = await res.json();
        if (!p) throw new Error('Musician not found.');

        renderSongs(p.songs || []);
        if (viewingOwnProfile) {
            document.getElementById('song-editor').hidden = false;
            document.getElementById('bio-edit').classList.remove('d-none');
            document.getElementById('profile-email').hidden = false;
            document.getElementById('profile-reviews').hidden = false;
            loadReviews();
        }

        setText('musician-name', p.stage_name || p.username, 'Musician');
        setText('username', '@' + p.username, '');
        currentBio = p.bio || '';
        setText('bio', p.bio, 'No bio yet.');
        setText('location', p.location, 'Not set');
        setText('email', p.email, '');
        // Postgres NUMERIC arrives as a string, so convert before formatting
        setText('price',
            p.starting_price != null ? '$' + Number(p.starting_price).toFixed(2) : '',
            'Not set');

        if (p.avatar_url) {
            document.getElementById('avatar').src = p.avatar_url;
        }
    } catch (err) {
        console.error('Could not load profile', err);
        songPlayer.textContent = err.message;
    }
}

// ---------- Reviews ----------
async function loadReviews() {
    const box = document.getElementById('reviews');
    try {
        const res = await fetch('/api/reviews');
        if (!res.ok) { box.textContent = 'Could not load reviews.'; return; }
        const reviews = await res.json();

        box.textContent = '';
        if (reviews.length === 0) {
            box.textContent = 'No reviews yet.';
            return;
        }

        reviews.forEach(r => {
            const item = document.createElement('div');
            item.className = 'border rounded p-3 mb-2';

            const head = document.createElement('strong');
            head.textContent = r.customer_name + ' · ' + '★'.repeat(r.rating);

            const body = document.createElement('p');
            body.className = 'mb-0';
            body.textContent = r.comment || '';

            item.append(head, body);
            box.appendChild(item);
        });
    } catch (err) {
        console.error('Could not load reviews', err);
        box.textContent = 'Could not load reviews.';
    }
}

// ---------- Editable bio ----------
function updateBioCount() {
    const len = document.getElementById('bio-input').value.length;
    document.getElementById('bio-count').textContent = len + '/500';
}

function startBioEdit() {
    document.getElementById('bio-input').value = currentBio;
    document.getElementById('bio-error').textContent = '';
    updateBioCount();
    document.getElementById('bio').classList.add('d-none');
    document.getElementById('bio-edit').classList.add('d-none');
    document.getElementById('bio-editor').classList.remove('d-none');
    document.getElementById('bio-input').focus();
}

function cancelBioEdit() {
    document.getElementById('bio-editor').classList.add('d-none');
    document.getElementById('bio').classList.remove('d-none');
    document.getElementById('bio-edit').classList.remove('d-none');
}

async function saveBio() {
    const saveBtn = document.getElementById('bio-save');
    const errorBox = document.getElementById('bio-error');
    const bio = document.getElementById('bio-input').value.trim();

    saveBtn.disabled = true;
    errorBox.textContent = '';
    try {
        const res = await fetch('/api/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bio })
        });
        if (res.status === 401) { window.location.href = '/login'; return; }
        const data = await res.json();
        if (!res.ok) {
            errorBox.textContent = data.error || 'Could not save bio.';
            return;
        }
        currentBio = data.bio;
        setText('bio', currentBio, 'No bio yet.');
        cancelBioEdit();
    } catch (err) {
        console.error('Could not save bio', err);
        errorBox.textContent = 'Could not save bio.';
    } finally {
        saveBtn.disabled = false;
    }
}

// ---------- Wire everything up ----------
document.getElementById('bio-edit').addEventListener('click', startBioEdit);
document.getElementById('bio-save').addEventListener('click', saveBio);
document.getElementById('bio-cancel').addEventListener('click', cancelBioEdit);
document.getElementById('bio-input').addEventListener('input', updateBioCount);

songForm.addEventListener('submit', saveSongs);
loadProfile();