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