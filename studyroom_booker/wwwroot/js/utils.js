const FIRST_HOUR = 8;
const LAST_HOUR = 20;

const dateFormatter = new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
});

const shortDateFormatter = new Intl.DateTimeFormat('hu-HU', {
    month: 'short', day: 'numeric', weekday: 'short'
});


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