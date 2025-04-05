// --- START OF FILE eventProcessing.js ---

const eventContainer = document.getElementById('event-container');
const timeline = document.getElementById('timeline');
const content = document.getElementById('event-content');
let selectedEvent = null;

// Global sets for filter options - populated during event processing
let texts = new Set();
let families = new Set();
let eventTypes = new Set();
let locations = new Set(); // <<<====== ADDED THIS LINE

// Assumes eventTypeColors is defined globally

// Function to get color for event type
function getColorForEventType(eventType) {
    if (typeof eventTypeColors === 'object' && eventTypeColors !== null && eventTypeColors.hasOwnProperty(eventType)) {
        return eventTypeColors[eventType];
    }
    // console.warn(`Color not found for event type: ${eventType}. Defaulting to grey.`); // Less noisy
    return '#808080'; // Default grey
}

// Optional: Generate random colors if needed
function generateColorsForEventTypes() {
    // ...(no changes needed here)...
    if (!(typeof eventTypes === 'object' && eventTypes instanceof Set)) return;
    if (typeof eventTypeColors !== 'object' || eventTypeColors === null) {
         eventTypeColors = {};
         console.warn("eventTypeColors object was not defined globally, initializing.");
    }
    eventTypes.forEach(eventType => {
        if (!eventTypeColors.hasOwnProperty(eventType)) {
            const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
            eventTypeColors[eventType] = randomColor;
            // console.log(`Generated random color for ${eventType}: ${randomColor}`); // Less noisy
        }
    });
}

// Function to update progress bar
function updateProgressBar(progress) {
    // ...(no changes needed here)...
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        // progressBar.textContent = `${Math.round(progress)}%`; // Optional text
    }
    if (progress >= 100 && progressBar) {
        setTimeout(() => { if(progressBar) progressBar.style.display = 'none'; }, 500);
    }
}


// Processing an individual event object
function processEvent(event) {
    if (!event) return;

    // Handle yearRange
    if (!event.year && event.yearRange && Array.isArray(event.yearRange) && event.yearRange.length === 2) {
        event.year = Math.round((event.yearRange[0] + event.yearRange[1]) / 2);
    } else if (!event.year) {
        // console.warn('Event has no year or valid yearRange:', event.title || 'Untitled Event'); // Less noisy
        event.year = 0;
    }

    // Populate global filter sets
    if (event.texts && Array.isArray(event.texts)) {
        event.texts.forEach(text => {
            if (text && text.trim() !== '') texts.add(text.trim());
        });
    }
    if (event.family && event.family.trim() !== '') {
        families.add(event.family.trim());
    }
    if (event.eventType && event.eventType.trim() !== '') {
        eventTypes.add(event.eventType.trim());
    }
    // *** ENSURE LOCATION IS ADDED ***
    if (event.location && event.location.trim() !== '') {
        // Check if locations Set exists before adding (defensive coding)
        if (typeof locations === 'object' && locations instanceof Set) {
            locations.add(event.location.trim());
        } else {
             console.warn(`Global 'locations' Set not available when processing event: ${event.title}`);
        }
    }
}


// Function to add a single event visually (no changes needed here)
function addEventToTimeline(event) {
    // ...(no changes needed here)...
    if (!event || !event.year || !event.title) {
        // console.warn("Skipping event due to missing data:", event);
        return;
    }
    if (!eventContainer) {
         console.error("Cannot add event: eventContainer not found.");
         return;
    }
    if (eventContainer.querySelector(`.event[title="${event.title}"]`)) {
        return; // Skip duplicates
    }
    let yearContainer = eventContainer.querySelector(`.year-container[data-year="${event.year}"]`);
    if (!yearContainer) {
        yearContainer = document.createElement('div');
        yearContainer.className = 'year-container';
        yearContainer.setAttribute('data-year', event.year);
        const minYear = 1;
        const maxYear = 2000;
        let leftPercent = ((event.year - minYear) / (maxYear - minYear)) * 100;
        leftPercent = Math.max(0, Math.min(100, leftPercent));
        yearContainer.style.left = `${leftPercent}%`;
        eventContainer.appendChild(yearContainer);
    }
    const newEventDot = document.createElement('div');
    newEventDot.className = 'event';
    newEventDot.setAttribute('title', event.title);
    newEventDot.setAttribute('data-year', event.year);
    newEventDot.setAttribute('data-description', event.description || 'No description available.');
    newEventDot.setAttribute('data-texts', JSON.stringify(event.texts || []));
    newEventDot.setAttribute('data-family', event.family || '');
    newEventDot.setAttribute('data-location', event.location || ''); // Store empty string if missing
    newEventDot.setAttribute('data-event-type', event.eventType || 'Unknown');
    newEventDot.style.backgroundColor = getColorForEventType(event.eventType);
    yearContainer.appendChild(newEventDot);
}


// Function to add click listeners (no changes needed here)
function updateEvents() {
    // ...(no changes needed here)...
    if (!content) {
         console.error("Event content display area not found.");
         return;
     }
    const events = document.querySelectorAll('.event');
    // console.log(`Adding/Updating click listeners for ${events.length} event dots.`); // Less noisy

    events.forEach(eventDot => {
         const clone = eventDot.cloneNode(true);
         // Check if parentNode exists before replacing - handles edge cases
         if(eventDot.parentNode) {
            eventDot.parentNode.replaceChild(clone, eventDot);
         } else {
            console.warn("Event dot had no parent node during listener update:", eventDot);
            return; // Skip this dot if it's somehow detached
         }

        clone.addEventListener('click', () => {
            if (selectedEvent && selectedEvent !== clone) {
                selectedEvent.classList.remove('selected');
            }
            clone.classList.add('selected');
            selectedEvent = clone;

            const year = clone.getAttribute('data-year');
            const title = clone.getAttribute('title');
            const description = clone.getAttribute('data-description');
            let textsDisplay = 'N/A';
             try {
                 const textsArray = JSON.parse(clone.getAttribute('data-texts') || '[]');
                 if (Array.isArray(textsArray) && textsArray.length > 0) {
                     textsDisplay = textsArray.join(', ');
                 }
             } catch (e) { /* Ignore parse error on click */ }

            const family = clone.getAttribute('data-family') || 'N/A';
            const location = clone.getAttribute('data-location') || 'N/A';
            const eventType = clone.getAttribute('data-event-type') || 'N/A';

            content.innerHTML = `
                <h2>${title} (${year ? `Year ${year}` : 'Year Unknown'})</h2>
                <p>${description}</p>
                <p><strong>Location:</strong> ${location}</p>
                <p><strong>Texts:</strong> ${textsDisplay}</p>
                <p><strong>Family:</strong> ${family}</p>
                <p><strong>Type:</strong> ${eventType}</p>
            `;
            content.scrollTop = 0;
        });
    });
}


// Consolidated function to load INITIAL events
async function loadEvents() {
    console.log("Starting initial event loading...");
    updateProgressBar(0);

    try {
        const eventFiles = [
            'JSONS/manuscripts.json', 'JSONS/uncials.json',
            'JSONS/historical_events.json', 'JSONS/extrabiblical.json',
            'JSONS/church_fathers.json', 'JSONS/likely-writing-date.json'
        ];
        const totalFiles = eventFiles.length;
        let filesLoaded = 0;

        // Fetch all JSON files concurrently
        const fetchPromises = eventFiles.map(file =>
            fetch(file)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP ${response.status} for ${file}`);
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) return response.json();
                    throw new Error(`Non-JSON response from ${file}`);
                })
                .then(data => {
                    filesLoaded++;
                    updateProgressBar((filesLoaded / totalFiles) * 100);
                    // console.log(`Loaded ${file}`); // Less noisy
                    return data;
                })
                .catch(error => {
                    console.error(`Error loading/parsing ${file}:`, error);
                    return null; // Allow Promise.all to complete
                })
        );

        const eventGroups = await Promise.all(fetchPromises);
        console.log("Initial file fetching complete. Processing data...");

        // Clear existing global sets before processing
        texts.clear();
        families.clear();
        eventTypes.clear();
        locations.clear(); // *** ENSURE locations is cleared ***

        // Process the data from successfully loaded files
        eventGroups.forEach(events => {
            if (events && Array.isArray(events)) {
                events.forEach(event => {
                    processEvent(event); // Populate ALL filter sets
                    addEventToTimeline(event);
                });
            }
        });

        console.log("Finished processing initial events.");
        console.log(`Unique Event Types: ${eventTypes.size}, Texts: ${texts.size}, Families: ${families.size}, Locations: ${locations.size}`);

        // Post-processing steps
        generateColorsForEventTypes();
        updateEvents(); // Add click listeners

        // Initialize UI elements that depend on the loaded data
        // Ensure functions are defined before calling
        if (typeof initializeFilters === 'function') {
            initializeFilters(); // Populate sidebar filter lists
        } else { console.error("initializeFilters function is not defined when loadEvents calls it."); }

        if (typeof generateLegend === 'function') {
            generateLegend(); // Create the legend
        } else { console.error("generateLegend function is not defined when loadEvents calls it."); }

        // Apply initial filter state
        if (typeof applyAllFilters === 'function') {
            console.log("Applying initial filter state...");
            applyAllFilters();
        } else { console.error("applyAllFilters function is not defined when loadEvents calls it."); }

        // Optional: Scroll timeline
        if (eventContainer) { // Scroll the container, not the bar
            const scrollWidth = eventContainer.scrollWidth || 2000;
            eventContainer.scrollLeft = scrollWidth / 4; // Start ~25% in
        }

    } catch (error) {
        console.error('FATAL Error during initial event loading:', error);
        updateProgressBar(100);
        if(content) content.innerHTML = `<h2>Error Loading Timeline Data</h2><p>Could not load the necessary data. Error: ${error.message}. Please try refreshing the page.</p>`;
    } finally {
        updateProgressBar(100); // Ensure progress bar hides
        console.log("Initial event loading process complete.");
    }
}
// --- END OF FILE eventProcessing.js ---
