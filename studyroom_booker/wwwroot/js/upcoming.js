async function loadUpcoming() {
    const filters = currentUser.isAdmin
        ? { from: todayIso() }
        : { from: todayIso(), mine: true };

    document.getElementById('upcomingTitle').textContent = currentUser.isAdmin
        ? 'Közelgő foglalások (mindenkié)'
        : 'Közelgő foglalásaim';

    try {
        const bookings = await api.getBookings(filters);
        renderUpcoming(bookings.filter(b => !isPastBooking(b)));
    } catch (error) {
        showMessage('danger', error.message);
    }
}

function renderUpcoming(bookings) {
    const list = document.getElementById('upcomingList');
    list.replaceChildren();

    if (bookings.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'text-muted mb-0';
        empty.textContent = 'Nincs közelgő foglalás.';
        list.append(empty);
        return;
    }

    for (const booking of bookings) {
        list.append(createUpcomingItem(booking));
    }
}

function createUpcomingItem(booking) {
    const item = document.createElement('div');
    item.className = 'list-group-item d-flex align-items-center gap-3 px-0';

    const info = document.createElement('div');
    info.className = 'me-auto';

    const title = document.createElement('div');
    title.className = 'fw-semibold';
    title.textContent = `${shortDateFormatter.format(parseIsoDate(booking.date))} · ${formatHour(booking.startHour)}–${formatHour(booking.endHour)}`;

    const details = document.createElement('small');
    details.className = 'text-muted';
    let detailsText = `${booking.roomName} · ${booking.peopleCount} fő`;

    if (currentUser.isAdmin) {
        detailsText += ` · ${booking.studentName} (${booking.neptunCode})`;
    }

    if (booking.note) {
        detailsText += ` · ${booking.note}`;
    }

    details.textContent = detailsText;
    info.append(title, details);

    const jumpButton = document.createElement('button');
    jumpButton.className = 'btn btn-outline-primary btn-sm';
    jumpButton.title = 'Ugrás erre a napra';
    jumpButton.innerHTML = '<i class="bi bi-calendar-event"></i>';
    jumpButton.addEventListener('click', () => {
        selectedDate = booking.date;
        loadDay();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-outline-danger btn-sm';
    deleteButton.title = 'Törlés';
    deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
    deleteButton.addEventListener('click', async () => {
        try {
            await deleteBooking(booking.id);
        } catch (error) {
            showMessage('danger', error.message);
        }
    });

    item.append(info, jumpButton, deleteButton);
    return item;
}