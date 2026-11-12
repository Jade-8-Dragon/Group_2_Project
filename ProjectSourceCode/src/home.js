document.addEventListener('DOMContentLoaded', async () => {
    const customerHome = document.getElementById('customer-home');
    const musicianHome = document.getElementById('musician-home');

    try {
        const response = await fetch('/api/me');

        if (!response.ok) {
            window.location.href = '/login';
            return;
        }

        const user = await response.json();

        if (user.user_type === 'customer') {
            if (customerHome) customerHome.style.display = 'block';
            if (musicianHome) musicianHome.style.display = 'none';
        } else if (user.user_type === 'musician') {
            if (musicianHome) musicianHome.style.display = 'block';
            if (customerHome) customerHome.style.display = 'none';
        }
    } catch (error) {
        console.error('Could not load user information:', error);
    }
});