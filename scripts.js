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

// Toggle legend visibility
document.getElementById('toggle-legend').addEventListener('click', () => {
    const legend = document.getElementById('legend');
    legend.classList.toggle('collapsed');
    const arrow = document.querySelector('#toggle-legend .arrow');
    arrow.classList.toggle('collapsed');
});

// Toggle sidebar visibility
document.getElementById('toggle-sidebar').addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    const arrow = document.querySelector('#toggle-sidebar .arrow-reverse');
    arrow.classList.toggle('collapsed');
});

// Fetch and load event data
async function loadEvents() {
    try {
        const historicalEvents = await fetch('historical_events.json').then(response => response.json());
        const manuscriptEvents = await fetch('manuscripts.json').then(response => response.json());
        const uncialEvents = await fetch('uncials.json').then(response => response.json());

        console.log('Historical Events:', historicalEvents);
        console.log('Manuscript Events:', manuscriptEvents);
        console.log('Uncial Events:', uncialEvents);

        timeline.innerHTML = '';

        // Add year labels
        addYearLabels();

        // Process and display events
        historicalEvents.forEach(event => {
            processEvent(event);
            addEventToTimeline(event);
            eventTypes.add(event.eventType);
        });

        manuscriptEvents.forEach(event => {
            processEvent(event);
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
            processEvent(event);
            console.log('Uncial Event:', event);  // Debugging uncial events
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

// Add year labels to the timeline
function addYearLabels() {
    const yearLabels = [
        { year: 0, left: '0%' },
        { year: 100, left: '7%' },
        { year: 150, left: '11%' },
        { year: 300, left: '22%' },
        { year: 500, left: '32%' },
        { year: 750, left: '53%' },
        { year: 1000, left: '71%' },
        { year: 1250, left: '90%' },
        { year: 1400, left: '100%' }
    ];

    yearLabels.forEach(label => {
        const yearLabel = document.createElement('div');
        yearLabel.className = 'year-label';
        yearLabel.style.left = label.left;
        yearLabel.innerText = label.year;
        timeline.appendChild(yearLabel);
    });
}

// Process each event to calculate its position on the timeline
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

const yearDotPlacements = {};

// Add an event to the timeline
function addEventToTimeline(event) {
    console.log('Adding event to timeline:', event);
    if (document.querySelector(`.event[title="${event.title}"]`)) {
        return;
    }

    const newEvent = document.createElement('div');
    newEvent.className = 'event';
    newEvent.setAttribute('data-year', event.year || (event.yearRange ? ((event.yearRange[0] + event.yearRange[1]) / 2).toFixed(0) : ''));
    newEvent.setAttribute('title', event.title);
    newEvent.setAttribute('data-description', event.description);
    newEvent.setAttribute('data-texts', JSON.stringify(event.texts || []));
    newEvent.setAttribute('data-family', event.family || '');
    newEvent.setAttribute('data-location', event.location || 'Unknown');
    newEvent.setAttribute('data-event-type', event.eventType);

    if (!yearDotPlacements[event.year]) {
        yearDotPlacements[event.year] = [];
    }

    const existingDots = yearDotPlacements[event.year];
    const positions = Array.from(document.querySelectorAll('.event')).map(e => ({
        left: parseFloat(e.style.left),
        top: parseFloat(e.style.top)
    }));

    let newLeft = (event.percentage * timeline.offsetWidth) / 100;
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

    // Set initial position
    newEvent.style.left = `${newLeft}px`;
    newEvent.style.top = '0px'; // Start at the line

    newEvent.style.backgroundColor = getColorForEventType(event.eventType);

    timeline.appendChild(newEvent);

    // Ensure year labels are always visible
    document.querySelectorAll('.year-label').forEach(label => {
        timeline.appendChild(label);
    });

    // Trigger transition to final position
    setTimeout(() => {
        newEvent.style.top = `${newTop}px`;
    }, 0);
}

// Shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Check if a position is occupied
function isPositionOccupied(left, top) {
    const existingEvents = Array.from(document.querySelectorAll('.event'));
    return existingEvents.some(e => {
        const eLeft = parseFloat(e.style.left);
        const eTop = parseFloat(e.style.top);
        return Math.abs(eLeft - left) < dotDiameter && Math.abs(eTop - top) < dotDiameter;
    });
}

// Update events to handle interactions
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
                                 <p><strong>Location:</strong> ${location}</p>
                                 <p><strong>Texts:</strong> ${texts}</p>
                                 <p><strong>Family:</strong> ${family}</p>`;
        });
    });
}

// Populate the text filter list
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

// Populate the family filter list
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

// Filter events by text
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

// Filter events by family
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

// CSS for greyed-out events
const css = `
    .greyed-out {
        display: none;
    }
    .event {
        transition: top 0.5s ease-out, left 0.5s ease-out;
    }
`;
const style = document.createElement('style');
style.appendChild(document.createTextNode(css));
document.head.appendChild(style);

// Initialize filters
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

// Generate colors for different event types
function generateColorsForEventTypes() {
    eventTypes.forEach(eventType => {
        if (!eventTypeColors[eventType]) {
            eventTypeColors[eventType] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        }
    });
}

// Get the color for a specific event type
function getColorForEventType(eventType) {
    return eventTypeColors[eventType];
}

// Load the events when the page loads
loadEvents();

// Generate the legend to explain event types
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

// Toggle visibility of events based on their type
function toggleEventsByType(eventType, isChecked) {
    const events = document.querySelectorAll(`.event[data-event-type="${eventType}"]`);
    events.forEach(event => {
        event.style.display = isChecked ? 'block' : 'none';
    });
}

// Toggle sidebar visibility
function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
}

// Zoom in on the timeline
document.getElementById('zoom-in').addEventListener('click', () => {
    scale *= 1.2;
    timeline.style.transform = `scale(${scale})`;
    timeline.style.transformOrigin = '0 50%'; // Ensure scaling starts from the left side
    timelineContainer.scrollLeft = 0; // Ensure the scroll is reset to the left
});

// Zoom out of the timeline
document.getElementById('zoom-out').addEventListener('click', () => {
    scale /= 1.2;
    timeline.style.transform = `scale(${scale})`;
    timeline.style.transformOrigin = '0 50%'; // Ensure scaling starts from the left side
    timelineContainer.scrollLeft = 0; // Ensure the scroll is reset to the left
});

// Handle double-click to zoom in on the timeline
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
    timeline.style.transformOrigin = '0 50%'; // Ensure scaling starts from the left side
});

let isDown = false;
let startX;
let scrollLeft;

// Handle dragging to scroll the timeline
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

// Ensure the timeline is centered on load
new ResizeObserver(() => {
    timelineContainer.scrollLeft = (timeline.scrollWidth - timelineContainer.clientWidth) / 2;
}).observe(timelineContainer);
