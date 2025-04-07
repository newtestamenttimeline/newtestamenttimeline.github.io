// --- START OF FILE eventProcessing.js ---

const eventContainer = document.getElementById('event-container');
const timeline = document.getElementById('timeline');
const content = document.getElementById('event-content');
let selectedEvent = null;

// Global sets for filter options - populated during event processing
let texts = new Set();
let families = new Set();
let eventTypes = new Set();
let locations = new Set(); // Ensure this is declared globally

// Assumes eventTypeColors is defined globally (e.g., in index.html <script> tag)

// Function to get color for event type
function getColorForEventType(eventType) {
    if (typeof eventTypeColors === 'object' && eventTypeColors !== null && eventTypeColors.hasOwnProperty(eventType)) {
        return eventTypeColors[eventType];
    }
    // console.warn(`Color not found for event type: ${eventType}. Defaulting to grey.`); // Less noisy
    return '#808080'; // Default grey
}

// Optional: Generate random colors for event types if not predefined
function generateColorsForEventTypes() {
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

// Function to set up and update the progress bar during initial load
function updateProgressBar(progress) {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        // Ensure progress is a number between 0 and 100
        const validProgress = Math.min(100, Math.max(0, Number(progress) || 0));
        progressBar.style.width = `${validProgress}%`;
        // progressBar.textContent = `${Math.round(validProgress)}%`; // Optional text

        // Hide progress bar when done (or on error)
        if (validProgress >= 100) {
             // Add a small delay so user sees 100% briefly
            setTimeout(() => {
                if(progressBar) progressBar.style.display = 'none';
            }, 500);
        } else {
            // Ensure bar is visible during loading
             progressBar.style.display = 'block';
        }
    }
}


// Processing an individual event object - Calculate year/range, populate Sets
function processEvent(event) {
    if (!event || typeof event !== 'object') {
         console.warn("processEvent called with invalid event data:", event);
         return; // Skip invalid event data
    }

    // Handle yearRange by calculating midpoint
    if (!event.year && event.yearRange && Array.isArray(event.yearRange) && event.yearRange.length === 2) {
        const year1 = Number(event.yearRange[0]);
        const year2 = Number(event.yearRange[1]);
        if (!isNaN(year1) && !isNaN(year2)) {
             event.year = Math.round((year1 + year2) / 2);
        } else {
             console.warn(`Invalid yearRange values for "${event.title}":`, event.yearRange);
             event.year = 0; // Default if range is invalid
        }
    } else if (event.year === undefined || event.year === null || isNaN(Number(event.year))) {
        // console.warn('Event has missing or invalid year:', event.title || 'Untitled Event'); // Less noisy
        event.year = 0; // Default to year 0 if missing/invalid
    } else {
         event.year = Number(event.year); // Ensure year is a number
    }


    // Populate global filter sets (check if Sets exist first)
    if (event.texts && Array.isArray(event.texts) && typeof texts === 'object' && texts instanceof Set) {
        event.texts.forEach(text => {
            const trimmedText = text?.trim();
            if (trimmedText) texts.add(trimmedText);
        });
    }
    const trimmedFamily = event.family?.trim();
    if (trimmedFamily && typeof families === 'object' && families instanceof Set) {
        families.add(trimmedFamily);
    }
    const trimmedEventType = event.eventType?.trim();
    if (trimmedEventType && typeof eventTypes === 'object' && eventTypes instanceof Set) {
        eventTypes.add(trimmedEventType);
    }
    const trimmedLocation = event.location?.trim();
    if (trimmedLocation && typeof locations === 'object' && locations instanceof Set) {
        locations.add(trimmedLocation);
    }
}


// Function to add a single event visually to the timeline
function addEventToTimeline(event) {
    // Basic validation
    if (!event || !event.year || !event.title) {
        // console.warn("Skipping event in addEventToTimeline due to missing data:", event); // Less noisy
        return;
    }
    if (!eventContainer) {
         console.error("Cannot add event: eventContainer not found.");
         return;
    }
     // Prevent adding exact duplicates based on title (basic check)
    if (eventContainer.querySelector(`.event[title="${CSS.escape(event.title)}"]`)) {
        // console.log(`Skipping duplicate event: ${event.title}`); // Less noisy
        return;
    }

    // Find or create the container for this specific year
    let yearContainer = eventContainer.querySelector(`.year-container[data-year="${event.year}"]`);
    if (!yearContainer) {
        yearContainer = document.createElement('div');
        yearContainer.className = 'year-container';
        yearContainer.setAttribute('data-year', event.year);

        // Calculate horizontal position based on year range (e.g., 1 to 2000)
        const minYear = 1;    // Define consistent min/max for positioning
        const maxYear = 2000;
        let leftPercent = ((event.year - minYear) / (maxYear - minYear)) * 100;
        leftPercent = Math.max(0, Math.min(100, leftPercent)); // Clamp position
        yearContainer.style.left = `${leftPercent}%`;

        eventContainer.appendChild(yearContainer);
    }

    // Create the event dot element
    const newEventDot = document.createElement('div');
    newEventDot.className = 'event'; // Base class for styling
    newEventDot.setAttribute('title', event.title); // Tooltip on hover

    // Store all relevant data on the element for easy access on click
    newEventDot.setAttribute('data-year', String(event.year));
    newEventDot.setAttribute('data-description', event.description || 'No description available.');
    newEventDot.setAttribute('data-texts', JSON.stringify(event.texts || [])); // Store as JSON string
    newEventDot.setAttribute('data-family', event.family || ''); // Empty string if no family
    newEventDot.setAttribute('data-location', event.location || ''); // Empty string if no location
    newEventDot.setAttribute('data-event-type', event.eventType || 'Unknown'); // Default if missing

    // Set background color based on event type
    newEventDot.style.backgroundColor = getColorForEventType(event.eventType);

    // Append the dot to its year container
    yearContainer.appendChild(newEventDot);
}


// Function to add click listeners to ALL event dots currently in the DOM
function updateEvents() {
    if (!content) {
        console.error("Event content display area (#event-content) not found.");
        return;
    }
    const events = document.querySelectorAll('.event');
    // console.log(`Adding/Updating click listeners for ${events.length} event dots.`); // Less noisy

    events.forEach(eventDot => {
        // Replace node to remove old listeners cleanly
        const clone = eventDot.cloneNode(true);
        if(eventDot.parentNode) {
            eventDot.parentNode.replaceChild(clone, eventDot);
        } else {
            // This shouldn't happen frequently, but good to log if it does
            console.warn("Event dot had no parent node during listener update:", eventDot);
            return; // Skip this orphaned dot
        }

        // Add the single click listener to the new clone
        clone.addEventListener('click', () => {
            // Deselect previously selected dot
            if (selectedEvent && selectedEvent !== clone) {
                selectedEvent.classList.remove('selected');
            }
            // Select the current dot
            clone.classList.add('selected');
            selectedEvent = clone; // Track the selected one

            // Get data from the clicked dot's attributes
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

            // Update the bottom content area safely
            content.innerHTML = `
                <h2>${title ? title : 'Event'} (${year ? `Year ${year}` : 'Year Unknown'})</h2>
                <p>${description}</p>
                <p><strong>Location:</strong> ${location}</p>
                <p><strong>Texts:</strong> ${textsDisplay}</p>
                <p><strong>Family:</strong> ${family}</p>
                <p><strong>Type:</strong> ${eventType}</p>
            `;
            // Scroll content area to top after update
            content.scrollTop = 0;
        });
    });
}


// Consolidated function to load INITIAL events from multiple JSON files
async function loadEvents() {
    console.log("Starting initial event loading...");
    updateProgressBar(0); // Show progress bar

    // Get container references needed for later operations (like centering)
    const timelineContainer = document.getElementById('timeline-container');
    const bigContainer = document.getElementById('big-container');

    // --- Main Try Block for Loading and Processing ---
    try {
        const eventFiles = [
            'JSONS/manuscripts.json', 'JSONS/uncials.json',
            'JSONS/historical_events.json', 'JSONS/extrabiblical.json',
            'JSONS/church_fathers.json', 'JSONS/likely-writing-date.json'
        ];
        const totalFiles = eventFiles.length;
        let filesLoaded = 0;

        // Fetch all JSON files concurrently using Promise.all
        const fetchPromises = eventFiles.map(file =>
            fetch(file)
                .then(response => {
                    // Check HTTP status and content type
                    if (!response.ok) throw new Error(`HTTP ${response.status} for ${file}`);
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        return response.json();
                    }
                    throw new Error(`Non-JSON response received from ${file}`);
                })
                .then(data => {
                    // Update progress on successful load and parse
                    filesLoaded++;
                    updateProgressBar((filesLoaded / totalFiles) * 100);
                    return data; // Pass data along
                })
                .catch(error => {
                    // Log errors but allow Promise.all to finish by returning null
                    console.error(`Error loading or parsing ${file}:`, error);
                    return null;
                })
        );

        // Wait for all fetches to settle (resolve or reject)
        const eventGroups = await Promise.all(fetchPromises);
        console.log("Initial file fetching complete. Processing data...");

        // Clear existing global Sets before populating with new data
        texts.clear();
        families.clear();
        eventTypes.clear();
        locations.clear(); // Ensure locations set is cleared

        // Process the data from successfully loaded files
        eventGroups.forEach(events => {
            // Check if the result is a valid array (not null from fetch error)
            if (events && Array.isArray(events)) {
                events.forEach(event => {
                    processEvent(event); // Populate filter Sets and process year/range
                    addEventToTimeline(event); // Add event visually to the DOM
                });
            }
        });

        console.log("Finished processing initial events.");
        console.log(`Unique Values Found -> Event Types: ${eventTypes.size}, Texts: ${texts.size}, Families: ${families.size}, Locations: ${locations.size}`);

        // --- Post-processing steps after data is loaded and processed ---
        generateColorsForEventTypes(); // Assign colors if needed
        updateEvents(); // Add click listeners to all the event dots

        // Initialize UI elements (filters, legend) that depend on the loaded data
        // Ensure the functions exist before calling them
        if (typeof initializeFilters === 'function') {
            initializeFilters(); // Populate sidebar filter lists
        } else { console.error("initializeFilters function is not defined when loadEvents calls it."); }

        if (typeof generateLegend === 'function') {
            generateLegend(); // Create the legend in the sidebar
        } else { console.error("generateLegend function is not defined when loadEvents calls it."); }

        // Apply initial filter state to show/hide dots based on default checkbox state
        if (typeof applyAllFilters === 'function') {
            console.log("Applying initial filter state...");
            applyAllFilters();
        } else { console.error("applyAllFilters function is not defined when loadEvents calls it."); }


        // --- Timeline Centering Logic (Horizontal & Vertical) ---
        if (timelineContainer && bigContainer) {
            // Use requestAnimationFrame to ensure layout calculations are complete
            requestAnimationFrame(() => { // Start RAF callback
                // Use a try-catch specifically for centering calculations
                try { // Start INNER try (for centering)
                    // --- Horizontal Centering ---
                    const totalContentWidth = bigContainer.scrollWidth;
                    const viewportWidth = timelineContainer.clientWidth;
                    // console.log(`H-Centering Check: Content Width=${totalContentWidth}, Viewport Width=${viewportWidth}`); // Less noisy
                    if (totalContentWidth > viewportWidth) {
                        const centerScrollLeft = (totalContentWidth - viewportWidth) / 2;
                        timelineContainer.scrollLeft = centerScrollLeft;
                        // console.log(`Timeline H-centered: scrollLeft set to ${centerScrollLeft}`); // Less noisy
                    } else {
                        timelineContainer.scrollLeft = 0; // Scroll to start if content fits
                    }

                    // --- Vertical Centering ---
                    const totalContentHeight = bigContainer.scrollHeight;
                    const viewportHeight = timelineContainer.clientHeight;
                    // console.log(`V-Centering Check: Content Height=${totalContentHeight}, Viewport Height=${viewportHeight}`); // Less noisy
                    if (totalContentHeight > viewportHeight) {
                        // Calculate scroll position to put the middle of content in the middle of viewport
                        const centerScrollTop = (totalContentHeight / 2) - (viewportHeight / 2);
                        // Set scroll position, ensuring it's not negative
                        timelineContainer.scrollTop = Math.max(0, centerScrollTop);
                        console.log(`Timeline V-centered: scrollTop set to ${timelineContainer.scrollTop}`); // Keep this log
                    } else {
                        // Content fits vertically, ensure scrolled to the top
                        timelineContainer.scrollTop = 0;
                    }
                } catch (e_center) { // End INNER try, start INNER catch for centering errors
                    console.error("Error during timeline centering calculation:", e_center);
                } // End INNER catch
            }); // End RAF callback
        } else {
            // Log warning if containers needed for centering aren't found
            console.warn("Could not center timeline: timelineContainer or bigContainer element not found.");
        }
        // --- End Timeline Centering Logic ---

    // --- End of Main Try Block ---
    } catch (error_load) { // --- Catch Errors from the main loading/processing Try block ---
        console.error('FATAL Error during initial event loading:', error_load);
        updateProgressBar(100); // Ensure progress bar hides even on error
        // Display a user-friendly error message in the content area
        if (content) {
             content.innerHTML = `<h2>Error Loading Timeline Data</h2><p>Could not load the necessary data. Error: ${error_load.message}. Please try refreshing the page.</p>`;
        }
    // --- Finally Block (runs regardless of success or error in try block) ---
    } finally {
        updateProgressBar(100); // Ensure progress bar hides cleanly
        console.log("Initial event loading process complete (finally block executed).");
    } // --- End Finally Block ---

} // --- End of loadEvents Function ---

// --- END OF FILE eventProcessing.js ---
