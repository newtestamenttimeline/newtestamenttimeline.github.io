const timeline = document.getElementById('timeline');
const timelineContainer = document.getElementById('timeline-container');
const content = document.getElementById('event-content');
const sidebar = document.getElementById('sidebar');
const legendContainer = document.getElementById('legend');
let scale = 1;
let selectedEvent = null;
const texts = new Set();
const families = new Set();
const eventTypes = new Set();
const dotDiameter = 12;
const spacing = 15;
const step = 5;

const eventTypeColors = {};

document.getElementById('toggle-legend').addEventListener('click', () => {
    const legend = document.getElementById('legend');
    legend.classList.toggle('collapsed');
    const arrow = document.querySelector('#toggle-legend .arrow');
    arrow.classList.toggle('collapsed');
});

document.getElementById('toggle-sidebar').addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    const arrow = document.querySelector('#toggle-sidebar .arrow-reverse');
    arrow.classList.toggle('collapsed');
});

async function loadEvents() {
    try {
        const historicalEvents = await fetch('historical_events.json').then(response => response.json());
        const manuscriptEvents = await fetch('manuscripts.json').then(response => response.json());
        const uncialEvents = await fetch('uncials.json').then(response => response.json());

        timeline.innerHTML = '';

        historicalEvents.forEach(event => {
            if (event.year) {
                event.percentage = Math.round((event.year / 1000) * 100);
            } else if (event.yearRange) {
                const midPoint = (event.yearRange[0] + event.yearRange[1]) / 2;
                event.percentage = Math.round((midPoint / 1000) * 100);
            }
            addEventToTimeline(event);
            eventTypes.add(event.eventType);
        });

        manuscriptEvents.forEach(event => {
            if (event.year) {
                event.percentage = Math.round((event.year / 1000) * 100);
            } else if (event.yearRange) {
                const midPoint = (event.yearRange[0] + event.yearRange[1]) / 2;
                event.percentage = Math.round((midPoint / 1000) * 100);
            }
            addEventToTimeline(event);
            if (event.texts) {
                event.texts.forEach(text => texts.add(text));
            }
            if (event.family) {
                families.add(event.family);
            }
            eventTypes.add(event.eventType);
        });

        uncialEvents.forEach(event => {
            if (event.year) {
                event.percentage = Math.round((event.year / 1000) * 100);
            } else if (event.yearRange) {
                const midPoint = (event.yearRange[0] + event.yearRange[1]) / 2;
                event.percentage = Math.round((midPoint / 1000) * 100);
            }
            addEventToTimeline(event);
            if (event.texts) {
                event.texts.forEach(text => texts.add(text));
            }
            if (event.family) {
                families.add(event.family);
            }
            eventTypes.add(event.eventType);
        });

        generateColorsForEventTypes();
        updateEvents();
        initializeFilters();
        populateTextList();
        populateFamilyList();
        generateLegend();
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

const yearDotPlacements = {};

function addEventToTimeline(event) {
    if (document.querySelector(`.event[title="${event.title}"]`)) {
        return;
    }

    const newEvent = document.createElement('div');
    newEvent.className = 'event';
    newEvent.setAttribute('data-year', event.year || event.yearRange ? ((event.yearRange[0] + event.yearRange[1]) / 2).toFixed(0) : '');
    newEvent.setAttribute('title', event.title);
    newEvent.setAttribute('data-description', event.description);
    newEvent.setAttribute('data-texts', JSON.stringify(event.texts || []));
    newEvent.setAttribute('data-family', event.family || '');
    newEvent.setAttribute('data-event-type', event.eventType);

    if (!yearDotPlacements[event.year]) {
        yearDotPlacements[event.year] = [];
    }

    const existingDots = yearDotPlacements[event.year];
    const positions = Array.from(document.querySelectorAll('.event')).map(e => ({
        left: parseFloat(e.style.left),
        top: parseFloat(e.style.top)
    }));

    let newLeft = (event.percentage / 1000) * 100;
    let newTop = 0;

    if (existingDots.length === 0) {
        newTop = 0;
    } else if (existingDots.length === 1) {
        newTop = Math.random() > 0.5 ? dotDiameter + spacing : -(dotDiameter + spacing);
    } else {
        const [lastTop] = existingDots.slice(-1);
        newTop = lastTop > 0 ? -(dotDiameter + spacing) : dotDiameter + spacing;

        if (isPositionOccupied(newLeft, newTop)) {
            const directions = [[0, -spacing], [0, spacing], [-spacing, 0], [spacing, 0]];
            shuffleArray(directions);
            let found = false;

            for (let i = 0; i < directions.length; i++) {
                const [dx, dy] = directions[i];
                if (!isPositionOccupied(newLeft + dx, newTop + dy)) {
                    newLeft += dx;
                    newTop += dy;
                    found = true;
                    break;
                }
            }

            if (!found) {
                let tries = 0;
                const maxTries = 1000;
                while (isPositionOccupied(newLeft, newTop) && tries < maxTries) {
                    newTop += newTop > 0 ? spacing + step : -(spacing + step);
                    tries++;
                }
            }
        }
    }

    yearDotPlacements[event.year].push(newTop);
    if (yearDotPlacements[event.year].length > 2) {
        yearDotPlacements[event.year].shift();
    }

    newEvent.style.left = `${newLeft}%`;
    newEvent.style.top = `${newTop}px`;

    newEvent.style.backgroundColor = getColorForEventType(event.eventType);

    timeline.appendChild(newEvent);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function isPositionOccupied(left, top) {
    const existingEvents = Array.from(document.querySelectorAll('.event'));
    return existingEvents.some(e => {
        const eLeft = parseFloat(e.style.left);
        const eTop = parseFloat(e.style.top);
        return Math.abs(eLeft - left) < dotDiameter && Math.abs(eTop - top) < dotDiameter;
    });
}

function updateEvents() {
    const events = document.querySelectorAll('.event');
    events.forEach(event => {
        event.addEventListener('click', () => {
            if (selectedEvent) {
                selectedEvent.classList.remove('selected');
            }
            selectedEvent = event;
            event.classList.add('selected');

            const year = event.getAttribute('data-year');
            const title = event.getAttribute('title');
            const description = event.getAttribute('data-description');
            const texts = JSON.parse(event.getAttribute('data-texts')).join(', ');
            const family = event.getAttribute('data-family');
            const location = event.getAttribute('data-location');
            content.innerHTML = `<h2>${title} (Year ${year})</h2>
                                 <p>${description}</p>
                                 <p>Texts: ${texts}</p>
                                 <p>Family: ${family}</p>
                                 <p>Location: ${location}</p>`;
        });
    });
}

function populateTextList() {
    const textList = document.getElementById('text-list');
    textList.innerHTML = '';
    texts.forEach(text => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<input type="checkbox" checked> ${text}`;
        listItem.querySelector('input').addEventListener('change', (e) => {
            filterEventsByText(text, e.target.checked);
        });
        textList.appendChild(listItem);
    });
}

function populateFamilyList() {
    const familyList = document.getElementById('family-list');
    familyList.innerHTML = '';
    families.forEach(family => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<input type="checkbox" checked> ${family}`;
        listItem.querySelector('input').addEventListener('change', (e) => {
            filterEventsByFamily(family, e.target.checked);
        });
        familyList.appendChild(listItem);
    });
}

function filterEventsByText(text, isChecked) {
    const events = document.querySelectorAll('.event');
    events.forEach(event => {
        const eventTexts = JSON.parse(event.getAttribute('data-texts'));
        if (isChecked && eventTexts.includes(text)) {
            event.classList.remove('greyed-out');
        } else if (!isChecked && eventTexts.includes(text)) {
            event.classList.add('greyed-out');
        }
    });
}

function filterEventsByFamily(family, isChecked) {
    const events = document.querySelectorAll('.event');
    events.forEach(event => {
        const eventFamily = event.getAttribute('data-family');
        if (isChecked && eventFamily === family) {
            event.classList.remove('greyed-out');
        } else if (!isChecked && eventFamily === family) {
            event.classList.add('greyed-out');
        }
    });
}

const css = `
    .greyed-out {
        display: none;
    }
`;
const style = document.createElement('style');
style.appendChild(document.createTextNode(css));
document.head.appendChild(style);

function initializeFilters() {
    const textList = document.getElementById('text-list');
    const familyList = document.getElementById('family-list');

    texts.forEach(text => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<input type="checkbox" checked> ${text}`;
        listItem.querySelector('input').addEventListener('change', (e) => {
            filterEventsByText(text, e.target.checked);
        });
        textList.appendChild(listItem);
    });

    families.forEach(family => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<input type="checkbox" checked> ${family}`;
        listItem.querySelector('input').addEventListener('change', (e) => {
            filterEventsByFamily(family, e.target.checked);
        });
        familyList.appendChild(listItem);
    });
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

loadEvents();

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

function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
}

document.getElementById('zoom-in').addEventListener('click', () => {
    scale *= 1.2;
    timeline.style.transform = `scale(${scale})`;
});

document.getElementById('zoom-out').addEventListener('click', () => {
    scale /= 1.2;
    timeline.style.transform = `scale(${scale})`;
});

timelineContainer.addEventListener('dblclick', (e) => {
    const rect = timelineContainer.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const targetPercentage = offsetX / rect.width;
    const targetScroll = targetPercentage * timeline.scrollWidth * scale - rect.width / 2;

    timelineContainer.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
    });

    scale *= 1.2;
    timeline.style.transform = `scale(${scale})`;
});

let isDown = false;
let startX;
let scrollLeft;

timelineContainer.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - timelineContainer.offsetLeft;
    scrollLeft = timelineContainer.scrollLeft;
});

timelineContainer.addEventListener('mouseleave', () => {
    isDown = false;
});

timelineContainer.addEventListener('mouseup', () => {
    isDown = false;
});

timelineContainer.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - timelineContainer.offsetLeft;
    const walk = (x - startX) * 3;
    timelineContainer.scrollLeft = scrollLeft - walk;
});

new ResizeObserver(() => {
    timelineContainer.scrollLeft = (timeline.scrollWidth - timelineContainer.clientWidth) / 2;
}).observe(timelineContainer);
