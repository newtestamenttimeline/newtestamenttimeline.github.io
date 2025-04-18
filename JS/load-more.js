// --- START OF FILE load-more.js ---

/**
 * Fetches JSON data from a given URL and handles potential errors.
 * @param {string} url - The URL to fetch JSON from.
 * @returns {Promise<Array|[]>} - A promise that resolves with the parsed JSON array or an empty array on error.
 */
async function fetchAndProcessJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch data from ${url}: ${response.statusText} (${response.status})`);
            return []; // Return empty array on fetch error
        }
        // Check content type before parsing
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            console.error(`Received non-JSON response from ${url}. Content-Type: ${contentType}`);
            return [];
        }
    } catch (error) {
        console.error(`Error fetching or parsing data from ${url}:`, error);
        return []; // Return empty array on network or parsing error
    }
}

/**
 * Adds newly loaded event data visually to the timeline by calling addEventToTimeline for each.
 * Also re-runs updateEvents to ensure click listeners are attached.
 * @param {Array} data - Array of event objects to add.
 */
function addEventsToTimelineDisplay(data) {
    // Ensure required functions are available globally
    if (typeof addEventToTimeline !== 'function') {
        console.error("Function addEventToTimeline is not defined. Cannot add events.");
        return;
    }
     if (typeof processEvent !== 'function') {
        console.warn("Function processEvent is not defined. Events might not be fully processed before adding.");
    }
    if (!Array.isArray(data)) {
        console.error("Invalid data (not an array) passed to addEventsToTimelineDisplay.");
        return;
    }

    console.log(`Adding ${data.length} new events to the timeline display.`);
    data.forEach(event => {
        if (typeof processEvent === 'function') {
            processEvent(event);
        }
        addEventToTimeline(event);
    });
    console.log("Finished adding new events to display.");

    if (typeof updateEvents === 'function') {
        console.log("Updating event listeners for all events after load more...");
        updateEvents();
    } else {
         console.warn("updateEvents function not found. Click listeners may not work on newly added events.");
    }
}

/**
 * Updates the global filter Sets (texts, families, locations, eventTypes) with new unique values
 * found in the loaded data and triggers re-rendering of the corresponding filter lists in the sidebar.
 * @param {Array} data - Array of newly loaded event objects.
 */
function updateFiltersWithNewData(data) {
    // Check input data validity
    if (!Array.isArray(data)) {
        console.error("Invalid data (not an array) passed to updateFiltersWithNewData.");
        return;
    }

    // *** Check availability and type of global sets BEFORE using them ***
    console.log("Inside updateFiltersWithNewData. Checking global sets availability:"); // Log Group 1
    const setsAreValid =
        typeof texts === 'object' && texts instanceof Set &&
        typeof families === 'object' && families instanceof Set &&
        typeof locations === 'object' && locations instanceof Set &&
        typeof eventTypes === 'object' && eventTypes instanceof Set;

    if (!setsAreValid) {
        console.error("updateFiltersWithNewData: FAILED global set check. One or more Sets are invalid or not ready.");
        console.log(` --> texts: ${typeof texts}, instanceof Set: ${texts instanceof Set}`);
        console.log(` --> families: ${typeof families}, instanceof Set: ${families instanceof Set}`);
        console.log(` --> locations: ${typeof locations}, instanceof Set: ${locations instanceof Set}`);
        console.log(` --> eventTypes: ${typeof eventTypes}, instanceof Set: ${eventTypes instanceof Set}`);
        return;
    }
    console.log("updateFiltersWithNewData: Global sets check PASSED."); // Log Group 1
    // *** END CHECK ***

    let newTextsAdded = false;
    let newFamiliesAdded = false;
    let newLocationsAdded = false;
    let newEventTypesAdded = false;

    // *** DEBUG LOG: Log families Set BEFORE loop ***
    console.log("[UpdateFiltersDebug] Families Set BEFORE processing new data:", new Set(families)); // Log Group 2

    console.log("[UpdateFiltersDebug] Checking for new filter options in loaded data..."); // Log Group 2
    data.forEach(event => {
        // Update Texts Set
        if (event.texts && Array.isArray(event.texts)) {
            event.texts.forEach(text => {
                const trimmedText = text?.trim();
                if (trimmedText && !texts.has(trimmedText)) {
                    texts.add(trimmedText); newTextsAdded = true;
                }
            });
        }

        // --- Family Update Logic with Logging ---
        const trimmedFamily = event.family?.trim();
        if (trimmedFamily) {
            // Optional detailed log: console.log(`[UpdateFiltersDebug] Checking family: "${trimmedFamily}" from event: ${event.title}`);
            if (!families.has(trimmedFamily)) {
                 // *** DEBUG LOG: Log when a NEW family is detected ***
                 console.log(`[UpdateFiltersDebug] >>> NEW Family DETECTED: "${trimmedFamily}"`); // Log Group 2 (CRUCIAL)
                 families.add(trimmedFamily);
                 newFamiliesAdded = true; // Set flag correctly here
            }
        }
        // --- End Family Logic ---

        // Update Locations Set
        const trimmedLocation = event.location?.trim();
        if (trimmedLocation && !locations.has(trimmedLocation)) {
            locations.add(trimmedLocation); newLocationsAdded = true;
        }
        // Update Event Types Set
        const trimmedEventType = event.eventType?.trim();
        if (trimmedEventType && !eventTypes.has(trimmedEventType)) {
            eventTypes.add(trimmedEventType); newEventTypesAdded = true;
        }
    });

     // *** DEBUG LOG: Log families Set AFTER loop and the flag state ***
     console.log("[UpdateFiltersDebug] Families Set AFTER processing new data:", new Set(families)); // Log Group 3
     console.log(`[UpdateFiltersDebug] newFamiliesAdded flag is: ${newFamiliesAdded}`); // Log Group 3


     // --- Re-render logic ---
     if (typeof createFilterList !== 'function') {
         console.error("createFilterList function not available. Cannot update sidebar filter lists.");
         if (newEventTypesAdded && typeof generateLegend !== 'function') {
              console.error("generateLegend function not available. Cannot update legend.");
         }
         return;
     }

     // Update Text List
     if (newTextsAdded) {
        const textList = document.getElementById('text-list');
        if (textList) { createFilterList(textList, texts, 'text'); }
     }

     // Re-render Family List
     if (newFamiliesAdded) { // Check the flag correctly
         const familyList = document.getElementById('family-list');
         if (familyList) {
             // *** DEBUG LOG: Log that the family list is being rebuilt ***
             console.log(`[UpdateFiltersDebug] ---> Re-rendering family filter list because newFamiliesAdded is true.`); // Log Group 4
             createFilterList(familyList, families, 'family'); // Use the UPDATED global families Set
         } else console.error("[UpdateFiltersDebug] Family list element (#family-list) not found for update.");
     } else {
          // *** DEBUG LOG: Log why family list *isn't* being rebuilt ***
          console.log(`[UpdateFiltersDebug] ---> NOT re-rendering family list because newFamiliesAdded is false.`); // Log Group 4
     }

     // Update Location List
     if (newLocationsAdded) {
        const locationList = document.getElementById('location-list');
        if (locationList) { createFilterList(locationList, locations, 'location'); }
     }
     // Update Legend if new types were added
     if (newEventTypesAdded && typeof generateLegend === 'function') { generateLegend(); }
}


/**
 * Main function triggered by the "Load More Manuscripts" button.
 * Fetches data for Minuscules and Lectionaries, adds them to the timeline,
 * updates filter options, and re-applies all filters.
 */
async function loadMoreManuscripts() {
    const loadButton = document.getElementById('load-more-manuscripts');
    if (loadButton && loadButton.disabled) {
        console.log("Load more already in progress or complete.");
        return;
    }
    if (loadButton) {
        loadButton.disabled = true;
        loadButton.textContent = "Loading...";
    }
    console.log('[Load More] Starting fetch...'); // Log Start

    const minusculesData = await fetchAndProcessJSON('JSONS/minuscules.json');
    const lectionariesData = await fetchAndProcessJSON('JSONS/lectionaries.json');

    if (minusculesData.length === 0 && lectionariesData.length === 0) {
        console.warn('[Load More] No additional manuscript data loaded.');
        if (loadButton) loadButton.textContent = "No More Data Found";
        return;
    }

    console.log(`[Load More] Data fetched: Minuscules=${minusculesData.length}, Lectionaries=${lectionariesData.length}`);
    const allNewData = [...minusculesData, ...lectionariesData];

    // --- Perform necessary updates ---
    console.log("[Load More] Calling addEventsToTimelineDisplay..."); // Log before
    try {
        addEventsToTimelineDisplay(allNewData);
        console.log("[Load More] addEventsToTimelineDisplay finished."); // Log after
         const dotCountAfterAdd = document.querySelectorAll('.event').length;
         console.log(`[Load More] Total event dots in DOM after adding new ones: ${dotCountAfterAdd}`);
    } catch (error) {
        console.error("[Load More] Error during addEventsToTimelineDisplay:", error);
        if (loadButton) loadButton.textContent = "Error Adding Events";
        return;
    }

    console.log("[Load More] Calling updateFiltersWithNewData..."); // Log before
    try {
        updateFiltersWithNewData(allNewData);
        console.log("[Load More] updateFiltersWithNewData finished."); // Log after
    } catch (error) {
         console.error("[Load More] Error during updateFiltersWithNewData:", error);
    }

    console.log("[Load More] Calling applyAllFilters..."); // Log before
    if (typeof applyAllFilters === 'function') {
        try {
             applyAllFilters();
             console.log("[Load More] applyAllFilters finished."); // Log after
             const visibleDotCount = document.querySelectorAll('.event[style*="display: block"]').length;
             const hiddenDotCount = document.querySelectorAll('.event[style*="display: none"]').length;
             console.log(`[Load More] Dots visible after filtering: ${visibleDotCount}, Hidden: ${hiddenDotCount}`);
        } catch(error) {
             console.error("[Load More] Error during applyAllFilters:", error);
             if (loadButton) loadButton.textContent = "Error Applying Filters";
        }
    } else {
        console.error("[Load More] applyAllFilters function is not defined. Cannot re-apply filters.");
         if (loadButton) loadButton.textContent = "Filter Error";
    }
    // --- Updates Complete ---

    console.log('[Load More] Finished processing loaded manuscripts.');
    if (loadButton) {
         const finalDotCount = document.querySelectorAll('.event').length;
         // A simple heuristic, assuming initial load had > 100 dots maybe? Adjust if needed.
         const expectedMinimumDots = 100 + allNewData.length / 2;
         if (finalDotCount > expectedMinimumDots) {
             loadButton.textContent = "Manuscripts Loaded";
         } else if (!loadButton.textContent.includes("Error")){
              loadButton.textContent = "Load Complete (Verify?)";
         }
         // Keep button disabled after load to prevent multiple loads
    }
}


// Ensure the DOM is fully loaded before adding the event listener to the button
document.addEventListener('DOMContentLoaded', () => {
    const loadMoreButton = document.getElementById('load-more-manuscripts');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', loadMoreManuscripts);
    } else {
        console.error('Load More Manuscripts button (#load-more-manuscripts) not found.');
    }
});

// --- END OF FILE load-more.js ---
