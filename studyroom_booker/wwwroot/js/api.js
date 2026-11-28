const api = {
    async request(method, url, body) {
        const options = { method, headers: {} };

        if (body !== undefined) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (response.status === 401 && !url.startsWith('/api/auth/')) {
            window.location.href = 'login.html';
            throw new Error('Nincs bejelentkezve.');
        }

        if (response.status === 204) {
            return null;
        }

        let data = null;
        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {
            throw new Error(data?.error ?? `Hiba történt (HTTP ${response.status})`);
        }

        return data;
    },

    toQuery(params) {
        const query = new URLSearchParams();

        for (const [key, value] of Object.entries(params ?? {})) {
            if (value !== undefined && value !== null && value !== '' && value !== false) {
                query.append(key, value);
            }
        }

        const text = query.toString();
        return text ? `?${text}` : '';
    },

    login(neptunCode, password) {
        return this.request('POST', '/api/auth/login', { neptunCode, password });
    },

    register(neptunCode, name, password) {
        return this.request('POST', '/api/auth/register', { neptunCode, name, password });
    },

    logout() {
        return this.request('POST', '/api/auth/logout');
    },

    me() {
        return this.request('GET', '/api/auth/me');
    },

    getUsers() {
        return this.request('GET', '/api/users');
    },

    getRooms() {
        return this.request('GET', '/api/rooms');
    },

    getBookings(filters) {
        return this.request('GET', '/api/bookings' + this.toQuery(filters));
    },

    getStats(filters) {
        return this.request('GET', '/api/stats' + this.toQuery(filters));
    },

    createBooking(booking) {
        return this.request('POST', '/api/bookings', booking);
    },

    updateBooking(id, booking) {
        return this.request('PUT', `/api/bookings/${id}`, booking);
    },

    deleteBooking(id) {
        return this.request('DELETE', `/api/bookings/${id}`);
    }
};
