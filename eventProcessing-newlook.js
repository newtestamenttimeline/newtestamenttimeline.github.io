// this is a variant of the file that would make the title of each manuscript or dot hover above it
// Function to get color for each event type
function getColorForEventType(eventType) {
    return eventTypeColors[eventType] || '#000'; // Default to black if no color is found
}

// Generate random colors for event types if needed
function generateColorsForEventTypes() {
    eventTypes.forEach(eventType => {
        if (!eventTypeColors[eventType]) {
            eventTypeColors[eventType] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        }
    });
}


// Global sets for texts, families, and event types
let texts = new Set();
let families = new Set();
let eventTypes = new Set();


let selectedEvent = null; // Ensure this is declared at the top
const content = document.getElementById('event-content');

// Consolidated loadEvents function to handle all event loading
async function loadEvents() {
    try {
        const totalFiles = 4; // Number of JSON files to load
        let filesLoaded = 0;

        // Fetch and process the event data from JSON files
        const eventFiles = [
            'historical_events.json',
            'manuscripts.json',
            'uncials.json',
            'church_fathers.json'
        ];

        const eventGroups = await Promise.all(
            eventFiles.map(file =>
                fetch(file)
                    .then(response => response.json())
                    .then(data => {
                        filesLoaded++;
                        updateProgressBar((filesLoaded / totalFiles) * 100);
                        return data;
                    })
                    .catch(error => {
                        console.error(`Error loading ${file}:`, error);
                    })
            )
        );

        // Process and add events to the timeline
        processEvents(...eventGroups);
        generateColorsForEventTypes();
        updateEvents();
        initializeFilters(); // Now call initializeFilters to populate the filters after events are processed
        generateLegend();  // Ensure the legend is generated after eventTypes is populated

    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// Function to process events and add them to the timeline
function processEvents(...eventGroups) {
    eventGroups.forEach(events => {
        if (!events) return; // Handle case where fetch might fail
        events.forEach(event => {
            processEvent(event);
            addEventToTimeline(event);

            // Add texts and families to the filter sets
            if (event.texts && Array.isArray(event.texts)) {
                event.texts.forEach(text => {
                    if (text && text.trim() !== '') {
                        texts.add(text);
                    }
                });
            }

            if (event.family && event.family.trim() !== '') {
                families.add(event.family);
            }

            eventTypes.add(event.eventType);
        });
    });
}

// Function to add an event to the timeline
function addEventToTimeline(event) {
    console.log('Adding event to timeline:', event);
    if (document.querySelector(`.event[title="${event.title}"]`)) return;

    const newEvent = document.createElement('div');
    newEvent.className = 'event';
    newEvent.setAttribute('data-year', event.year || '');
    newEvent.setAttribute('title', event.title);
    newEvent.setAttribute('data-description', event.description);
    newEvent.setAttribute('data-texts', JSON.stringify(event.texts || []));
    newEvent.setAttribute('data-family', event.family || '');
    newEvent.setAttribute('data-location', event.location || 'Unknown');
    newEvent.setAttribute('data-event-type', event.eventType);

    // Create the title element
    const titleLabel = document.createElement('div');
    titleLabel.className = 'event-title';
    titleLabel.innerText = event.title;

    // Append the title above the event dot
    newEvent.appendChild(titleLabel);

    let newLeft = (event.percentage * timeline.offsetWidth) / 100;
    let newTop = parseFloat(event.y);

    newEvent.style.left = `${newLeft}px`;
    newEvent.style.top = `${newTop}px`;
    newEvent.style.backgroundColor = getColorForEventType(event.eventType);

    timeline.appendChild(newEvent);

    // Ensure year labels are visible
    document.querySelectorAll('.year-label').forEach(label => {
        timeline.appendChild(label);
    });
}

// Processing the event to calculate its position on the timeline
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

// Function to update the events on the timeline
function updateEvents() {
    const events = document.querySelectorAll('.event');
    events.forEach(event => {
        event.addEventListener('click', () => {
            if (selectedEvent) selectedEvent.classList.remove('selected');
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

// Set up the progress bar (assumed to be in your HTML)
function updateProgressBar(progress) {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
}

window.loadEvents = loadEvents;
