// --- START OF FILE eventProcessing.js ---

const eventContainer = document.getElementById('event-container');
const timeline = document.getElementById('timeline'); // Get timeline element reference
const content = document.getElementById('event-content'); // Content display area
let selectedEvent = null; // Track the currently selected event dot

// Global sets for filter options - populated during event processing
let texts = new Set();
let families = new Set();
let eventTypes = new Set(); // Holds unique event types found

// Assumes eventTypeColors is defined globally (e.g., in index.html <script> tag)
// let eventTypeColors = { ... }; // Defined elsewhere

// Function to get color for each event type
function getColorForEventType(eventType) {
    // Check if eventTypeColors is defined and has the type
    if (typeof eventTypeColors === 'object' && eventTypeColors !== null && eventTypeColors.hasOwnProperty(eventType)) {
        return eventTypeColors[eventType];
    }
    console.warn(`Color not found for event type: ${eventType}. Defaulting to grey.`);
    return '#808080'; // Default to grey if color is missing
}

// Optional: Generate random colors for event types if not predefined
function generateColorsForEventTypes() {
    if (!(typeof eventTypes === 'object' && eventTypes instanceof Set)) return;
    if (typeof eventTypeColors !== 'object' || eventTypeColors === null) {
         eventTypeColors = {}; // Initialize if not defined
         console.warn("eventTypeColors object was not defined globally, initializing.");
    }

    eventTypes.forEach(eventType => {
        if (!eventTypeColors.hasOwnProperty(eventType)) {
            // Simple random color generator - might produce similar/ugly colors
            const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
            eventTypeColors[eventType] = randomColor;
            console.log(`Generated random color for ${eventType}: ${randomColor}`);
        }
    });
}

// Function to set up and update the progress bar during initial load
function updateProgressBar(progress) {
    const progressBar = document.getElementById('progress-bar'); // Assuming element exists
    if (progressBar) {
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`; // Clamp between 0 and 100
        progressBar.textContent = `${Math.round(progress)}%`; // Optional: Show percentage text
    }
    // Hide progress bar when done
    if (progress >= 100 && progressBar) {
        setTimeout(() => { progressBar.style.display = 'none'; }, 500); // Hide after a short delay
    }
}


// Processing an individual event object - Calculate year/percentage if needed
function processEvent(event) {
    if (!event) return;

    // Handle yearRange by calculating midpoint
    if (!event.year && event.yearRange && Array.isArray(event.yearRange) && event.yearRange.length === 2) {
        const midPoint = Math.round((event.yearRange[0] + event.yearRange[1]) / 2);
        event.year = midPoint; // Assign calculated midpoint as the primary year
        console.log(`Calculated midpoint year ${event.year} for "${event.title}" from range ${event.yearRange}`);
    } else if (!event.year) {
         console.warn('Event has no year or valid yearRange:', event.title || 'Untitled Event');
         event.year = 0; // Default to year 0 if missing? Or handle differently?
    }

    // Optional: Calculate percentage if needed for positioning (though CSS now uses year directly)
    // const minYear = 1; // Define timeline start year
    // const maxYear = 2000; // Define timeline end year
    // event.percentage = ((event.year - minYear) / (maxYear - minYear)) * 100;

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
}


// Function to add a single event visually to the timeline
function addEventToTimeline(event) {
    if (!event || !event.year || !event.title) {
        console.warn("Skipping event due to missing data:", event);
        return;
    }
    if (!eventContainer) {
         console.error("Cannot add event: eventContainer not found.");
         return;
    }
     // Prevent adding duplicates based on title (simple check)
    if (eventContainer.querySelector(`.event[title="${event.title}"]`)) {
        // console.log(`Skipping duplicate event: ${event.title}`);
        return;
    }

    // Find or create the container for this specific year
    let yearContainer = eventContainer.querySelector(`.year-container[data-year="${event.year}"]`);
    if (!yearContainer) {
        yearContainer = document.createElement('div');
        yearContainer.className = 'year-container';
        yearContainer.setAttribute('data-year', event.year);

        // Calculate horizontal position based on year range (e.g., 1 to 2000)
        const minYear = 1;    // Adjust as needed
        const maxYear = 2000; // Adjust as needed
        let leftPercent = ((event.year - minYear) / (maxYear - minYear)) * 100;
        leftPercent = Math.max(0, Math.min(100, leftPercent)); // Clamp between 0% and 100%
        yearContainer.style.left = `${leftPercent}%`;

        eventContainer.appendChild(yearContainer);
    }

    // Create the event dot element
    const newEventDot = document.createElement('div');
    newEventDot.className = 'event'; // Base class for styling
    newEventDot.setAttribute('title', event.title); // Tooltip on hover

    // Store all relevant data on the element for easy access on click
    newEventDot.setAttribute('data-year', event.year);
    newEventDot.setAttribute('data-description', event.description || 'No description available.');
    newEventDot.setAttribute('data-texts', JSON.stringify(event.texts || [])); // Store as JSON string
    newEventDot.setAttribute('data-family', event.family || ''); // Empty string if no family
    newEventDot.setAttribute('data-location', event.location || 'Unknown');
    newEventDot.setAttribute('data-event-type', event.eventType || 'Unknown'); // Default if missing

    // Set background color based on event type
    newEventDot.style.backgroundColor = getColorForEventType(event.eventType);

    // Append the dot to its year container
    yearContainer.appendChild(newEventDot);

     // Note: Click listener is added by updateEvents() after all initial events are loaded,
     // or needs to be handled dynamically for 'load more'.
}


// Function to add click listeners to ALL event dots currently in the DOM
function updateEvents() {
     if (!content) {
         console.error("Event content display area not found.");
         return;
     }
    const events = document.querySelectorAll('.event');
    console.log(`Adding/Updating click listeners for ${events.length} event dots.`);

    events.forEach(eventDot => {
        // Remove existing listener to prevent duplicates if function is called multiple times
         // This requires storing the listener function reference, or using a simpler approach:
         const clone = eventDot.cloneNode(true); // Clone to remove old listeners
         eventDot.parentNode.replaceChild(clone, eventDot); // Replace original with clone
         // Now add the listener to the clone

        clone.addEventListener('click', () => {
            // Deselect previously selected dot (if any)
            if (selectedEvent && selectedEvent !== clone) {
                selectedEvent.classList.remove('selected');
            }
            // Select the current dot
            clone.classList.add('selected');
            selectedEvent = clone; // Update tracked selected event

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
             } catch (e) { console.error("Error parsing texts data on click:", e); }

            const family = clone.getAttribute('data-family') || 'N/A';
            const location = clone.getAttribute('data-location') || 'N/A';
            const eventType = clone.getAttribute('data-event-type') || 'N/A';

            // Update the bottom content area
            content.innerHTML = `
                <h2>${title} (${year ? `Year ${year}` : 'Year Unknown'})</h2>
                <p>${description}</p>
                <p><strong>Location:</strong> ${location}</p>
                <p><strong>Texts:</strong> ${textsDisplay}</p>
                <p><strong>Family:</strong> ${family}</p>
                <p><strong>Type:</strong> ${eventType}</p>
            `;
             // Optional: Scroll content area to top
             content.scrollTop = 0;
        });
    });
}


// Consolidated function to load INITIAL events from multiple JSON files
async function loadEvents() {
    console.log("Starting initial event loading...");
    updateProgressBar(0); // Initialize progress bar

    try {
        const eventFiles = [
            'JSONS/manuscripts.json',        // Papyri typically
            'JSONS/uncials.json',
            'JSONS/historical_events.json',
            'JSONS/extrabiblical.json',
            'JSONS/church_fathers.json',
            'JSONS/likely-writing-date.json'
            // Add more initial files here if needed
        ];
        const totalFiles = eventFiles.length;
        let filesLoaded = 0;

        // Fetch all JSON files concurrently
        const fetchPromises = eventFiles.map(file =>
            fetch(file)
                .then(response => {
                    if (!response.ok) {
                         throw new Error(`HTTP error ${response.status} for ${file}`);
                    }
                     const contentType = response.headers.get("content-type");
                     if (contentType && contentType.indexOf("application/json") !== -1) {
                        return response.json();
                     } else {
                         throw new Error(`Received non-JSON response from ${file}`);
                     }
                })
                .then(data => {
                    filesLoaded++;
                    updateProgressBar((filesLoaded / totalFiles) * 100);
                    console.log(`Loaded ${file}`);
                    return data; // Return the parsed JSON data
                })
                .catch(error => {
                    console.error(`Error loading or parsing ${file}:`, error);
                    // Decide how to handle errors: return null, empty array, or rethrow
                    return null; // Return null for failed files
                })
        );

        // Wait for all fetch promises to settle
        const eventGroups = await Promise.all(fetchPromises);

        console.log("All initial files fetched (some might have failed). Processing data...");

        // Clear existing global sets before processing
        texts.clear();
        families.clear();
        eventTypes.clear();

        // Process the data from successfully loaded files
        eventGroups.forEach(events => {
            if (events && Array.isArray(events)) { // Check if data is valid array
                 events.forEach(event => {
                     processEvent(event); // Populate filter sets and process year/range
                     addEventToTimeline(event); // Add event visually
                 });
            }
        });

        console.log("Finished processing initial events.");
        console.log("Unique Event Types found:", Array.from(eventTypes));
        console.log("Unique Texts found:", Array.from(texts));
        console.log("Unique Families found:", Array.from(families));

        // Post-processing steps
        generateColorsForEventTypes(); // Ensure all types have colors
        updateEvents(); // Add click listeners to the newly added event dots

        // Initialize UI elements that depend on the loaded data
         if (typeof initializeFilters === 'function') {
            initializeFilters(); // Populate sidebar filter lists (Texts, Families)
        } else { console.error("initializeFilters function not found."); }

        if (typeof generateLegend === 'function') {
            generateLegend(); // Create the legend based on found eventTypes
        } else { console.error("generateLegend function not found."); }


        // *** MODIFICATION: Apply all filters initially ***
        if (typeof applyAllFilters === 'function') {
             console.log("Applying initial filter state...");
             applyAllFilters();
        } else { console.error("applyAllFilters function not found."); }

        // Optional: Scroll timeline to a default position
        if (timeline) {
             timeline.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
        }


    } catch (error) {
        // Catch any critical error during the process
        console.error('FATAL Error during initial event loading:', error);
        updateProgressBar(100); // Hide progress bar even on error
         // Display error message to user?
         if(content) content.innerHTML = "<h2>Error Loading Timeline Data</h2><p>Could not load the necessary data. Please try refreshing the page.</p>";
    } finally {
         updateProgressBar(100); // Ensure progress bar hides
         console.log("Initial event loading process complete.");
    }
}

// Expose loadEvents globally if it needs to be called from elsewhere (e.g., main.js)
// However, it's better practice to call it from within a DOMContentLoaded listener in main.js or here.
// window.loadEvents = loadEvents; // Avoid if possible

// --- END OF FILE eventProcessing.js ---
