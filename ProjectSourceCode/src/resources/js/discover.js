document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('musician-search');
    const searchButton = document.getElementById('search-button');
    const musicianList = document.getElementById('musician-list');

    async function loadMusicians(search = '') {
        try {
            const response = await fetch(
                `/api/musicians?search=${encodeURIComponent(search)}`
            );

            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }

            if (!response.ok) {
                throw new Error('Could not load musicians.');
            }

            const musicians = await response.json();

            musicianList.replaceChildren();

            if (musicians.length === 0) {
                musicianList.textContent = 'No musicians found.';
                return;
            }

            musicians.forEach(musician => {
                const card = document.createElement('div');
                card.className = 'musician-card';

                const name = document.createElement('h3');
                name.textContent =
                    musician.stage_name || musician.username;

                const bio = document.createElement('p');
                bio.textContent = musician.bio || 'No bio available.';

                const location = document.createElement('p');
                location.textContent =
                    musician.location || 'Location not provided';

                const price = document.createElement('p');
                price.textContent = musician.starting_price != null
                    ? `Starting price: $${musician.starting_price}`
                    : 'Price not provided';

                const profileLink = document.createElement('a');
                profileLink.href = `/musicians/${musician.user_id}`;
                profileLink.textContent = 'View Profile';

                card.append(name, bio, location, price, profileLink);
                musicianList.appendChild(card);
            });

        } catch (error) {
            console.error('Error loading musicians:', error);
            musicianList.textContent = 'Unable to load musicians.';
        }
    }

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            loadMusicians(searchInput.value.trim());
        });

        searchInput.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                loadMusicians(searchInput.value.trim());
            }
        });
    }

    if (musicianList) {
        loadMusicians();
    }
});