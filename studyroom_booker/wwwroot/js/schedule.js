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
    cell.title = `${booking.studentName}, ${formatHour(booking.startHour)}–${formatHour(booking.endHour)}${booking.note ? ', ' + booking.note : ''}`;

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