async function requireLogin() {
    let user;

    try {
        user = await api.me();
    } catch {
        window.location.href = 'login.html';
        return null;
    }

    renderUserMenu(user);
    return user;
}

function renderUserMenu(user) {
    const menu = document.getElementById('userMenu');
    menu.replaceChildren();

    const name = document.createElement('span');
    name.className = 'navbar-text text-white me-3';
    name.textContent = `${user.name} (${user.neptunCode})`;

    const logoutButton = document.createElement('button');
    logoutButton.className = 'btn btn-outline-light btn-sm';
    logoutButton.innerHTML = '<i class="bi bi-box-arrow-right"></i> Kilépés';
    logoutButton.addEventListener('click', logout);

    menu.append(name);

    if (user.isAdmin) {
        const role = document.createElement('span');
        role.className = 'badge text-bg-warning me-3';
        role.textContent = 'Admin';
        menu.append(role);
    }

    menu.append(logoutButton);
}

async function logout() {
    try {
        await api.logout();
    } finally {
        window.location.href = 'login.html';
    }
}
