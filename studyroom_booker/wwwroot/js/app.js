const FIRST_HOUR = 8;
const LAST_HOUR = 20;

const dateFormatter = new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
});

const shortDateFormatter = new Intl.DateTimeFormat('hu-HU', {
    month: 'short', day: 'numeric', weekday: 'short'
});

let currentUser = null;
let rooms = [];
let users = [];
let selectedDate = todayIso();
let editingBookingId = null;
let bookingModal = null;

function toIsoDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function todayIso() {
    return toIsoDate(new Date());
}

function parseIsoDate(iso) {
    return new Date(iso + 'T00:00:00');
}

function addDays(iso, days) {
    const date = parseIsoDate(iso);
    date.setDate(date.getDate() + days);
    return toIsoDate(date);
}

function formatHour(hour) {
    return `${hour}:00`;
}

function isPastSlot(dateIso, hour) {
    const today = todayIso();

    if (dateIso !== today) {
        return dateIso < today;
    }

    return hour <= new Date().getHours();
}

function isPastBooking(booking) {
    const today = todayIso();

    if (booking.date !== today) {
        return booking.date < today;
    }

    return booking.endHour <= new Date().getHours();
}

function showMessage(type, text) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.textContent = text;

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close';
    closeButton.dataset.bsDismiss = 'alert';
    alert.append(closeButton);

    const area = document.getElementById('messageArea');
    area.replaceChildren(alert);
}

async function loadDay() {
    document.getElementById('dateInput').value = selectedDate;
    document.getElementById('dateTitle').textContent = dateFormatter.format(parseIsoDate(selectedDate));

    try {
        const bookings = await api.getBookings({ date: selectedDate });
        renderSchedule(bookings);
    } catch (error) {
        showMessage('danger', error.message);
    }
}

function renderSchedule(bookings) {
    const table = document.getElementById('schedule');
    table.replaceChildren();

    const headerRow = table.createTHead().insertRow();
    const corner = document.createElement('th');
    corner.className = 'room-col';
    corner.textContent = 'Terem';
    headerRow.append(corner);

    for (let hour = FIRST_HOUR; hour < LAST_HOUR; hour++) {
        const th = document.createElement('th');
        th.textContent = formatHour(hour);
        headerRow.append(th);
    }

    const body = table.createTBody();

    for (const room of rooms) {
        const row = body.insertRow();
        row.append(createRoomCell(room));

        const roomBookings = bookings.filter(b => b.roomId === room.id);
        let hour = FIRST_HOUR;

        while (hour < LAST_HOUR) {
            const booking = roomBookings.find(b => b.startHour === hour);

            if (booking) {
                row.append(createBookingCell(booking));
                hour = booking.endHour;
            } else {
                row.append(createFreeCell(room, hour));
                hour++;
            }
        }
    }
}

function createRoomCell(room) {
    const cell = document.createElement('th');
    cell.className = 'room-col';

    const name = document.createElement('div');
    name.textContent = room.name;

    const details = document.createElement('small');
    details.className = 'text-muted fw-normal';
    details.textContent = room.equipment
        ? `${room.capacity} fő · ${room.equipment}`
        : `${room.capacity} fő`;

    cell.append(name, details);
    return cell;
}

function createBookingCell(booking) {
    const cell = document.createElement('td');
    cell.colSpan = booking.endHour - booking.startHour;
    cell.className = 'booking';

    if (isPastBooking(booking)) {
        cell.classList.add('past');
    } else if (booking.userId === currentUser.id) {
        cell.classList.add('mine');
    }

    const name = document.createElement('span');
    name.className = 'booking-name';
    name.textContent = booking.studentName;

    const time = document.createElement('small');
    time.className = 'd-block';
    time.textContent = `${formatHour(booking.startHour)}–${formatHour(booking.endHour)}`;

    cell.append(name, time);

    if (booking.note) {
        const note = document.createElement('small');
        note.className = 'd-block text-muted';
        note.textContent = booking.note;
        cell.append(note);
    }

    cell.addEventListener('click', () => onBookingClick(booking));
    return cell;
}

function createFreeCell(room, hour) {
    const cell = document.createElement('td');
    cell.className = 'slot';

    if (isPastSlot(selectedDate, hour)) {
        cell.classList.add('past');
    } else {
        cell.textContent = '+';
        cell.addEventListener('click', () => openNewBooking(room.id, hour));
    }

    return cell;
}

function fillHourSelects() {
    const start = document.getElementById('bookingStart');
    const end = document.getElementById('bookingEnd');

    for (let hour = FIRST_HOUR; hour < LAST_HOUR; hour++) {
        start.add(new Option(formatHour(hour), hour));
    }

    for (let hour = FIRST_HOUR + 1; hour <= LAST_HOUR; hour++) {
        end.add(new Option(formatHour(hour), hour));
    }
}

function fillRoomSelect() {
    const select = document.getElementById('bookingRoom');
    select.replaceChildren();

    for (const room of rooms) {
        select.add(new Option(`${room.name} (${room.capacity} fő)`, room.id));
    }
}

function setupOwnerField() {
    if (currentUser.isAdmin) {
        const select = document.getElementById('bookingOwner');
        select.replaceChildren();

        for (const user of users) {
            select.add(new Option(`${user.name} (${user.neptunCode})`, user.id));
        }

        document.getElementById('ownerSelectGroup').classList.remove('d-none');
    } else {
        const text = document.getElementById('ownerText');
        text.textContent = `Foglaló: ${currentUser.name} (${currentUser.neptunCode})`;
        text.classList.remove('d-none');
    }
}

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

function showBookingError(message) {
    const error = document.getElementById('bookingError');
    error.textContent = message;
    error.classList.remove('d-none');
}

function hideBookingError() {
    document.getElementById('bookingError').classList.add('d-none');
}

function openNewBooking(roomId, hour) {
    editingBookingId = null;
    document.getElementById('bookingModalTitle').textContent = 'Új foglalás';
    document.getElementById('bookingRoom').value = roomId;
    document.getElementById('bookingDate').value = selectedDate;
    document.getElementById('bookingStart').value = hour;
    document.getElementById('bookingEnd').value = hour + 1;
    document.getElementById('bookingPeople').value = 1;
    document.getElementById('bookingNote').value = '';
    document.getElementById('bookingOwner').value = currentUser.id;
    document.getElementById('deleteBookingButton').classList.add('d-none');

    hideBookingError();
    bookingModal.show();
}

function openEditBooking(booking) {
    editingBookingId = booking.id;
    document.getElementById('bookingModalTitle').textContent = 'Foglalás módosítása';
    document.getElementById('bookingRoom').value = booking.roomId;
    document.getElementById('bookingDate').value = booking.date;
    document.getElementById('bookingStart').value = booking.startHour;
    document.getElementById('bookingEnd').value = booking.endHour;
    document.getElementById('bookingPeople').value = booking.peopleCount;
    document.getElementById('bookingNote').value = booking.note ?? '';
    document.getElementById('bookingOwner').value = booking.userId;
    document.getElementById('deleteBookingButton').classList.remove('d-none');

    hideBookingError();
    bookingModal.show();
}

function onBookingClick(booking) {
    if (!booking.canEdit) {
        const time = `${formatHour(booking.startHour)}–${formatHour(booking.endHour)}`;
        showMessage('warning', `Ezt az időpontot ${booking.studentName} foglalta (${time}). Csak a saját foglalásodat módosíthatod.`);
        return;
    }

    openEditBooking(booking);
}

async function deleteBooking(id) {
    if (!confirm('Biztosan törlöd ezt a foglalást?')) {
        return false;
    }

    await api.deleteBooking(id);
    showMessage('success', 'A foglalás törölve.');
    await loadDay();
    await loadUpcoming();
    return true;
}

document.getElementById('bookingStart').addEventListener('change', () => {
    const start = Number(document.getElementById('bookingStart').value);
    const end = document.getElementById('bookingEnd');

    if (Number(end.value) <= start) {
        end.value = start + 1;
    }
});

document.getElementById('bookingForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    hideBookingError();

    const booking = {
        roomId: Number(document.getElementById('bookingRoom').value),
        date: document.getElementById('bookingDate').value,
        startHour: Number(document.getElementById('bookingStart').value),
        endHour: Number(document.getElementById('bookingEnd').value),
        peopleCount: Number(document.getElementById('bookingPeople').value),
        note: document.getElementById('bookingNote').value.trim() || null
    };

    if (currentUser.isAdmin) {
        booking.userId = Number(document.getElementById('bookingOwner').value);
    }

    const isEditing = editingBookingId != null;

    try {
        if (isEditing) {
            await api.updateBooking(editingBookingId, booking);
        } else {
            await api.createBooking(booking);
        }
    } catch (error) {
        showBookingError(error.message);
        return;
    }

    bookingModal.hide();
    selectedDate = booking.date;
    await loadDay();
    await loadUpcoming();
    showMessage('success', isEditing ? 'A foglalás módosítva.' : 'A foglalás elkészült.');
});

document.getElementById('deleteBookingButton').addEventListener('click', async () => {
    try {
        if (await deleteBooking(editingBookingId)) {
            bookingModal.hide();
        }
    } catch (error) {
        showBookingError(error.message);
    }
});

document.getElementById('prevDay').addEventListener('click', () => {
    selectedDate = addDays(selectedDate, -1);
    loadDay();
});

document.getElementById('nextDay').addEventListener('click', () => {
    selectedDate = addDays(selectedDate, 1);
    loadDay();
});

document.getElementById('todayButton').addEventListener('click', () => {
    selectedDate = todayIso();
    loadDay();
});

document.getElementById('dateInput').addEventListener('change', (event) => {
    if (event.target.value) {
        selectedDate = event.target.value;
        loadDay();
    }
});

async function init() {
    currentUser = await requireLogin();

    if (currentUser == null) {
        return;
    }

    bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
    fillHourSelects();

    try {
        rooms = await api.getRooms();

        if (currentUser.isAdmin) {
            users = await api.getUsers();
        }
    } catch (error) {
        showMessage('danger', error.message);
        return;
    }

    fillRoomSelect();
    setupOwnerField();
    await loadDay();
    await loadUpcoming();
}

init();