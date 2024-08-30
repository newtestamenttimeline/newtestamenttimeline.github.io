async function loadEvents() {
    try {
        const totalFiles = 4; // Number of JSON files to load!
        let filesLoaded = 0;

        // Fetch and process initial events
        const historicalEvents = await fetch('historical_events.json').then(response => response.json());
        filesLoaded++;
        updateProgressBar((filesLoaded / totalFiles) * 100);

        const manuscriptEvents = await fetch('manuscripts.json').then(response => response.json());
        filesLoaded++;
        updateProgressBar((filesLoaded / totalFiles) * 100);

        const uncialsEvents = await fetch('uncials.json').then(response => response.json());
        filesLoaded++;
        updateProgressBar((filesLoaded / totalFiles) * 100);

        const churchFathersEvents = await fetch('church_fathers.json').then(response => response.json());
        filesLoaded++;
        updateProgressBar((filesLoaded / totalFiles) * 100);

        // Process initial events
        processEvents(historicalEvents, manuscriptEvents, uncialsEvents, churchFathersEvents);

        // Initial updates
        generateColorsForEventTypes(); // Optional, can be removed if all event types are predefined
        updateEvents();
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

function processEvents(...eventGroups) {
    eventGroups.forEach(events => {
        events.forEach(event => {
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
    });
}

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

    let newLeft = (event.percentage * timeline.offsetWidth) / 100;
    let newTop = parseFloat(event.y); // Get y coordinate directly from the JSON

    newEvent.style.left = `${newLeft}px`;
    newEvent.style.top = `${newTop}px`;
    newEvent.style.backgroundColor = getColorForEventType(event.eventType);

    timeline.appendChild(newEvent);

    // Ensure year labels are always visible
    document.querySelectorAll('.year-label').forEach(label => {
        timeline.appendChild(label);
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
