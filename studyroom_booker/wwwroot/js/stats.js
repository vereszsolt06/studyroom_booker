const DAY_LABELS = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'];
const BLUE = '13, 110, 253';
const charts = {};

const periodFormatter = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });

function buildFilters(days) {
    if (days === 'all') {
        return {};
    }

    const today = todayIso();
    return { from: addDays(today, -(days - 1)), to: today };
}

async function loadStats(days) {
    for (const button of document.querySelectorAll('#rangeButtons button')) {
        button.classList.toggle('active', button.dataset.days === String(days));
    }

    try {
        const stats = await api.getStats(buildFilters(days));
        render(stats);
    } catch (error) {
        showMessage('danger', error.message);
    }
}

function render(stats) {
    document.getElementById('messageArea').replaceChildren();
    renderPeriod(stats);
    renderKpis(stats);
    renderRoomsChart(stats);
    renderHourlyChart(stats);
    renderHeatmap(stats.heatmap);
    renderTopStudents(stats.topStudents);
}

function renderPeriod(stats) {
    const text = document.getElementById('periodText');

    if (stats.from == null || stats.to == null) {
        text.textContent = 'Nincs foglalás ebben az időszakban.';
        return;
    }

    text.textContent = `${periodFormatter.format(parseIsoDate(stats.from))} – ${periodFormatter.format(parseIsoDate(stats.to))}`;
}

function renderKpis(stats) {
    document.getElementById('kpiBookings').textContent = stats.totalBookings;
    document.getElementById('kpiHours').textContent = stats.totalHours;
    document.getElementById('kpiHoursSub').textContent = `átlagosan ${stats.averageLength.toLocaleString('hu-HU')} óra / foglalás`;
    document.getElementById('kpiRoom').textContent = stats.busiestRoom ?? '–';
    document.getElementById('kpiPeak').textContent = stats.busiestHour == null ? '–' : `${stats.busiestHour}:00`;
    document.getElementById('kpiPeakSub').textContent = `${stats.uniqueStudents} különböző diák`;
}

function drawChart(key, canvasId, config) {
    if (charts[key]) {
        charts[key].destroy();
    }

    charts[key] = new Chart(document.getElementById(canvasId), config);
}

function renderRoomsChart(stats) {
    drawChart('rooms', 'roomsChart', {
        type: 'bar',
        data: {
            labels: stats.rooms.map(r => r.name),
            datasets: [{
                data: stats.rooms.map(r => r.utilization),
                backgroundColor: `rgba(${BLUE}, 0.75)`,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const room = stats.rooms[context.dataIndex];
                            return `${room.utilization}% – ${room.bookings} foglalás, ${room.hours} óra`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    ticks: { callback: (value) => `${value}%` }
                }
            }
        }
    });
}

function renderHourlyChart(stats) {
    drawChart('hourly', 'hourlyChart', {
        type: 'bar',
        data: {
            labels: stats.hourly.map(h => formatHour(h.hour)),
            datasets: [{
                data: stats.hourly.map(h => h.count),
                backgroundColor: stats.hourly.map(h => h.hour === stats.busiestHour ? '#dc3545' : '#9ec5fe'),
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.y} foglalt terem-óra`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });
}

function renderHeatmap(heatmap) {
    const table = document.getElementById('heatmap');
    table.replaceChildren();

    const max = Math.max(0, ...heatmap.flat());

    const headRow = document.createElement('tr');
    headRow.append(document.createElement('th'));

    for (let hour = FIRST_HOUR; hour < LAST_HOUR; hour++) {
        const cell = document.createElement('th');
        cell.textContent = hour;
        headRow.append(cell);
    }

    table.append(headRow);

    heatmap.forEach((row, day) => {
        const tableRow = document.createElement('tr');

        const label = document.createElement('th');
        label.textContent = DAY_LABELS[day];
        tableRow.append(label);

        for (const value of row) {
            const intensity = max === 0 ? 0 : value / max;
            const cell = document.createElement('td');
            cell.textContent = value;
            cell.style.backgroundColor = `rgba(${BLUE}, ${intensity})`;
            cell.style.color = intensity > 0.5 ? '#fff' : '#212529';
            tableRow.append(cell);
        }

        table.append(tableRow);
    });
}

function renderTopStudents(students) {
    const body = document.getElementById('topStudents');
    body.replaceChildren();

    if (students.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 3;
        cell.className = 'text-muted';
        cell.textContent = 'Nincs adat.';
        row.append(cell);
        body.append(row);
        return;
    }

    students.forEach((student, index) => {
        const row = document.createElement('tr');

        const name = document.createElement('td');
        name.textContent = index === 0 ? `🏆 ${student.name}` : student.name;

        const bookings = document.createElement('td');
        bookings.className = 'text-end';
        bookings.textContent = student.bookings;

        const hours = document.createElement('td');
        hours.className = 'text-end';
        hours.textContent = student.hours;

        row.append(name, bookings, hours);
        body.append(row);
    });
}

document.getElementById('rangeButtons').addEventListener('click', (event) => {
    const button = event.target.closest('button');

    if (button == null) {
        return;
    }

    const days = button.dataset.days === 'all' ? 'all' : Number(button.dataset.days);
    loadStats(days);
});

requireLogin().then((user) => {
    if (user != null) {
        loadStats(30);
    }
});
