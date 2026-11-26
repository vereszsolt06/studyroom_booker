const FIRST_HOUR = 8;
const LAST_HOUR = 20;

const dateFormatter = new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
});

let currentUser = null;
let rooms = [];
let selectedDate = todayIso();

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

    return cell;
}

function createFreeCell(room, hour) {
    const cell = document.createElement('td');
    cell.className = 'slot';

    if (isPastSlot(selectedDate, hour)) {
        cell.classList.add('past');
    } else {
        cell.textContent = '+';
    }

    return cell;
}

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

    try {
        rooms = await api.getRooms();
    } catch (error) {
        showMessage('danger', error.message);
        return;
    }

    await loadDay();
}

init();
