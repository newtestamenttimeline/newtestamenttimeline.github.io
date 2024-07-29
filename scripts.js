const canvas = document.getElementById('timelineCanvas');
const ctx = canvas.getContext('2d');
const content = document.getElementById('event-content');
const sidebar = document.getElementById('sidebar');
const legendContainer = document.getElementById('legend');
let scale = 1;
let selectedEvent = null;
const texts = new Set();
const families = new Set();
const eventTypes = new Set();
const eventTypeColors = {};
let allEvents = [];

document.getElementById('toggle-legend')?.addEventListener('click', () => {
    const legend = document.getElementById('legend');
    legend.classList.toggle('collapsed');
    const arrow = document.querySelector('#toggle-legend .arrow');
    arrow.classList.toggle('collapsed');
});

document.getElementById('toggle-sidebar')?.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    const arrow = document.querySelector('#toggle-sidebar .arrow-reverse');
    arrow.classList.toggle('collapsed');
});

async function loadEvents() {
    try {
        const historicalEvents = await fetch('historical_events.json').then(response => response.json());
        const manuscriptEvents = await fetch('manuscripts.json').then(response => response.json());
        const uncialEvents = await fetch('uncials.json').then(response => response.json());

        allEvents = [...historicalEvents, ...manuscriptEvents, ...uncialEvents];
        console.log('Loaded Events:', allEvents); // Debugging: log loaded events

        allEvents.forEach(event => {
            processEvent(event);
            eventTypes.add(event.eventType);
            if (event.texts) {
                event.texts.forEach(text => texts.add(text));
            }
            if (event.family) {
                families.add(event.family);
            }
        });

        generateColorsForEventTypes();
        drawTimeline(allEvents);
        initializeFilters();
        populateTextList();
        populateFamilyList();
        generateLegend();
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

function drawTimeline(events) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    events.forEach(event => {
        const x = (event.year / 1400) * canvas.width;
        const y = canvas.height / 2;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = getColorForEventType(event.eventType);
        ctx.fill();
        ctx.closePath();
        console.log(`Drawing event ${event.title} at (${x}, ${y}) with color ${ctx.fillStyle}`);
    });
}

function processEvent(event) {
    if (event.year) {
        event.percentage = (event.year / 1400) * 100;
    } else if (event.yearRange) {
        const midPoint = (event.yearRange[0] + event.yearRange[1]) / 2;
        event.year = midPoint;
        event.percentage = (midPoint / 1400) * 100;
    } else {
        console.warn('Event has no year or yearRange:', event);
    }
    console.log('Processed Event:', event);
}

function generateColorsForEventTypes() {
    eventTypes.forEach(eventType => {
        if (!eventTypeColors[eventType]) {
            eventTypeColors[eventType] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        }
    });
}

function getColorForEventType(eventType) {
    return eventTypeColors[eventType];
}

function initializeFilters() {
    populateTextList();
    populateFamilyList();
}

function populateTextList() {
    const textList = document.getElementById('text-list');
    if (!textList) return;
    textList.innerHTML = '';
    texts.forEach(text => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<input type="checkbox" checked> ${text}`;
        listItem.querySelector('input').addEventListener('change', (e) => {
            filterEvents();
        });
        textList.appendChild(listItem);
    });
}

function populateFamilyList() {
    const familyList = document.getElementById('family-list');
    if (!familyList) return;
    familyList.innerHTML = '';
    families.forEach(family => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<input type="checkbox" checked> ${family}`;
        listItem.querySelector('input').addEventListener('change', (e) => {
            filterEvents();
        });
        familyList.appendChild(listItem);
    });
}

function filterEvents() {
    const activeTexts = new Set(
        [...document.querySelectorAll('#text-list input:checked')].map(input => input.parentElement.textContent.trim())
    );
    const activeFamilies = new Set(
        [...document.querySelectorAll('#family-list input:checked')].map(input => input.parentElement.textContent.trim())
    );

    const filteredEvents = allEvents.filter(event => {
        const matchesText = event.texts ? event.texts.some(text => activeTexts.has(text)) : true;
        const matchesFamily = event.family ? activeFamilies.has(event.family) : true;
        return matchesText && matchesFamily;
    });

    drawTimeline(filteredEvents);
}

function generateLegend() {
    legendContainer.innerHTML = '';

    eventTypes.forEach(eventType => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';

        const legendColor = document.createElement('div');
        legendColor.className = 'legend-color';
        legendColor.style.backgroundColor = getColorForEventType(eventType);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'legend-checkbox';
        checkbox.checked = true;
        checkbox.addEventListener('change', (e) => {
            toggleEventsByType(eventType, e.target.checked);
        });

        const label = document.createElement('span');
        label.textContent = eventType.charAt(0).toUpperCase() + eventType.slice(1) + ' Events';

        const questionMark = document.createElement('span');
        questionMark.className = 'question-mark';
        questionMark.textContent = '?';
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip';
        tooltip.textContent = `Filter events by ${eventType} type`;
        questionMark.appendChild(tooltip);
        legendItem.appendChild(checkbox);
        legendItem.appendChild(legendColor);
        legendItem.appendChild(label);
        legendItem.appendChild(questionMark);

        legendContainer.appendChild(legendItem);
    });

    const events = document.querySelectorAll('.event');
    events.forEach(event => {
        const eventType = event.getAttribute('data-event-type');
        if (eventTypeColors[eventType]) {
            event.style.backgroundColor = eventTypeColors[eventType];
        }
    });
}

function toggleEventsByType(eventType, isChecked) {
    const events = document.querySelectorAll(`.event[data-event-type="${eventType}"]`);
    events.forEach(event => {
        event.style.display = isChecked ? 'block' : 'none';
    });
}

document.getElementById('zoom-in')?.addEventListener('click', () => {
    scale *= 1.2;
    canvas.style.transform = `scale(${scale})`;
});

document.getElementById('zoom-out')?.addEventListener('click', () => {
    scale /= 1.2;
    canvas.style.transform = `scale(${scale})`;
});

canvas.addEventListener('dblclick', (e) => {
    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const targetPercentage = offsetX / rect.width;
    const targetScroll = targetPercentage * canvas.scrollWidth * scale - rect.width / 2;

    canvas.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
    });

    scale *= 1.2;
    canvas.style.transform = `scale(${scale})`;
});

let isDown = false;
let startX;
let scrollLeft;

canvas.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - canvas.offsetLeft;
    scrollLeft = canvas.scrollLeft;
});

canvas.addEventListener('mouseleave', () => {
    isDown = false;
});

canvas.addEventListener('mouseup', () => {
    isDown = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - canvas.offsetLeft;
    const walk = (x - startX) * 3;
    canvas.scrollLeft = scrollLeft - walk;
});

new ResizeObserver(() => {
    canvas.scrollLeft = (canvas.scrollWidth - canvas.clientWidth) / 2;
}).observe(canvas);

loadEvents();

// Register service worker for client-side caching
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
            console.log('ServiceWorker registration failed: ', error);
        });
}
