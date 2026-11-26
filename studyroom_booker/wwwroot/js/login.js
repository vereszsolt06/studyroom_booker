const errorAlert = document.getElementById('errorAlert');

function showError(message) {
    errorAlert.textContent = message;
    errorAlert.classList.remove('d-none');
}

function hideError() {
    errorAlert.classList.add('d-none');
}

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    hideError();

    const neptunCode = document.getElementById('loginNeptun').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        await api.login(neptunCode, password);
        window.location.href = 'index.html';
    } catch (error) {
        showError(error.message);
    }
});

document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    hideError();

    const neptunCode = document.getElementById('registerNeptun').value.trim();
    const name = document.getElementById('registerName').value.trim();
    const password = document.getElementById('registerPassword').value;

    try {
        await api.register(neptunCode, name, password);
        window.location.href = 'index.html';
    } catch (error) {
        showError(error.message);
    }
});

document.querySelectorAll('.nav-link').forEach((tab) => {
    tab.addEventListener('shown.bs.tab', hideError);
});

document.querySelectorAll('.demo-account').forEach((button) => {
    button.addEventListener('click', () => {
        bootstrap.Tab.getOrCreateInstance(document.getElementById('loginTab')).show();
        document.getElementById('loginNeptun').value = button.dataset.neptun;
        document.getElementById('loginPassword').value = button.dataset.password;
    });
});

async function redirectIfLoggedIn() {
    try {
        await api.me();
        window.location.href = 'index.html';
    } catch {
    }
}

redirectIfLoggedIn();
