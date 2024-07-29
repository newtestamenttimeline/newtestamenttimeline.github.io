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
const dotRadius = 6;
const dotDiameter = dotRadius * 2;
const spacing = 20; // Minimum space between dots
const maxLayers = 5; // Maximum number of layers to try placing dots

// Add event listeners for sidebar and legend toggles
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

// Load and process events
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

    // Draw timeline line
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // Draw year labels
    const interval = 100; // Interval for year labels
    const startYear = 0;
    const endYear = 1400;
    for (let year = startYear; year <= endYear; year += interval) {
        const x = (year / endYear) * canvas.width;
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.fillText(year, x, canvas.height / 2 - 10);
        ctx.beginPath();
        ctx.moveTo(x, canvas.height / 2 - 5);
        ctx.lineTo(x, canvas.height / 2 + 5);
        ctx.stroke();
        ctx.closePath();
    }

    const drawnPositions = [];
    events.forEach(event => {
        let x = (event.year / 1400) * canvas.width;
        let placed = false;

        for (let layer = 0; layer < maxLayers; layer++) {
            let y = canvas.height / 2 + (layer * dotDiameter * 2);
            if (!isOverlapping(x, y, drawnPositions)) {
                drawnPositions.push({ x, y });
                ctx.beginPath();
                ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
                ctx.fillStyle = getColorForEventType(event.eventType);
                ctx.fill();
                ctx.closePath();
                console.log(`Drawing event ${event.title} at (${x}, ${y}) with color ${ctx.fillStyle}`); // Debugging: log event drawing details
                placed = true;
                break;
            }

            y = canvas.height / 2 - (layer * dotDiameter * 2);
            if (!isOverlapping(x, y, drawnPositions)) {
                drawnPositions.push({ x, y });
                ctx.beginPath();
                ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
                ctx.fillStyle = getColorForEventType(event.eventType);
                ctx.fill();
                ctx.closePath();
                console.log(`Drawing event ${event.title} at (${x}, ${y}) with color ${ctx.fillStyle}`); // Debugging: log event drawing details
                placed = true;
                break;
            }
        }

        if (!placed) {
            console.warn(`Could not place event ${event.title} without overlap.`);
        }
    });
}

function isOverlapping(x, y, positions) {
    return positions.some(pos => {
        const dx = x - pos.x;
        const dy = y - pos.y;
        return Math.sqrt(dx * dx + dy * dy) < dotDiameter;
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
    console.log('Processed Event:', event); // Debugging: log processed event
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
        listItem.querySelector('input').addEventListener('change', () => {
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
        listItem.querySelector('input').addEventListener('change', () => {
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
}

function toggleEventsByType(eventType, isChecked) {
    const events = document.querySelectorAll(`.event[data-event-type="${eventType}"]`);
    events.forEach(event => {
        event.style.display = isChecked ? 'block' : 'none';
    });
}

// Add zoom functionality
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
