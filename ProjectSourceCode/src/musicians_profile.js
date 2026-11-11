// Musician profile page behavior. Loaded with `defer`, so the DOM is ready when this runs.

let currentBio = ''; // the real saved bio, not the "No bio yet." fallback

function setText(id, value, fallback) {
    document.getElementById(id).textContent = value || fallback;
}

// ---------- Profile ----------
async function loadProfile() {
    try {
        const res = await fetch('/api/profile');
        if (res.status === 401) {
            window.location.href = '/login';
            return;
        }
        const p = await res.json();

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

loadProfile();
loadReviews();