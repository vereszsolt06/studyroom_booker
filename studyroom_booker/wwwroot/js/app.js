let currentUser = null;
let rooms = [];
let users = [];
let selectedDate = todayIso();
let editingBookingId = null;
let bookingModal = null;

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