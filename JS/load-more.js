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
            // const text = await response.text(); // Log the actual response if needed
            // console.error("Response text:", text);
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
        // Continue, but be aware positions/years might be inconsistent if processing is needed
    }
    if (!Array.isArray(data)) {
        console.error("Invalid data (not an array) passed to addEventsToTimelineDisplay.");
        return;
    }

    console.log(`Adding ${data.length} new events to the timeline display.`);
    data.forEach(event => {
        // Process event first if the function exists (e.g., calculate year from range)
        if (typeof processEvent === 'function') {
            processEvent(event);
        }
        // Add the event visually
        addEventToTimeline(event);
    });
    console.log("Finished adding new events to display.");

    // Re-run updateEvents to add click listeners to new AND old events
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
    console.log("Inside updateFiltersWithNewData. Checking global sets availability:");
    const setsAreValid =
        typeof texts === 'object' && texts instanceof Set &&
        typeof families === 'object' && families instanceof Set &&
        typeof locations === 'object' && locations instanceof Set &&
        typeof eventTypes === 'object' && eventTypes instanceof Set;

    if (!setsAreValid) {
        console.error("updateFiltersWithNewData: FAILED global set check. One or more Sets are invalid or not ready.");
        // Log details for debugging
        console.log(` --> texts: ${typeof texts}, instanceof Set: ${texts instanceof Set}`);
        console.log(` --> families: ${typeof families}, instanceof Set: ${families instanceof Set}`);
        console.log(` --> locations: ${typeof locations}, instanceof Set: ${locations instanceof Set}`);
        console.log(` --> eventTypes: ${typeof eventTypes}, instanceof Set: ${eventTypes instanceof Set}`);
        return; // Stop execution if sets are broken
    }
    console.log("updateFiltersWithNewData: Global sets check PASSED.");
    // *** END CHECK ***

    let newTextsAdded = false;
    let newFamiliesAdded = false;
    let newLocationsAdded = false;
    let newEventTypesAdded = false; // Track if legend needs update

    // Iterate through the newly loaded data to find unique filter values
    data.forEach(event => {
        // Update Texts Set
        if (event.texts && Array.isArray(event.texts)) {
            event.texts.forEach(text => {
                const trimmedText = text?.trim(); // Handle null/undefined text
                if (trimmedText && !texts.has(trimmedText)) {
                    texts.add(trimmedText);
                    newTextsAdded = true;
                }
            });
        }
        // Update Families Set
        const trimmedFamily = event.family?.trim();
        if (trimmedFamily && !families.has(trimmedFamily)) {
            families.add(trimmedFamily);
            newFamiliesAdded = true;
        }
        // Update Locations Set
        const trimmedLocation = event.location?.trim();
        if (trimmedLocation && !locations.has(trimmedLocation)) {
            locations.add(trimmedLocation);
            newLocationsAdded = true;
        }
        // Update Event Types Set
        const trimmedEventType = event.eventType?.trim();
        if (trimmedEventType && !eventTypes.has(trimmedEventType)) {
            eventTypes.add(trimmedEventType);
            newEventTypesAdded = true;
            // Optionally generate color immediately if needed:
            // if(typeof generateColorsForEventTypes === 'function') generateColorsForEventTypes();
        }
    });

    // Re-render filter lists in the sidebar only if new items were added for that category
    // Ensure the necessary function and container elements exist first

    if (typeof createFilterList !== 'function') {
        console.error("createFilterList function not available. Cannot update sidebar filter lists.");
        // If legend update needed, check for its function too
        if (newEventTypesAdded && typeof generateLegend !== 'function') {
             console.error("generateLegend function not available. Cannot update legend.");
        }
        return; // Can't proceed without createFilterList
    }

    // Update Text List
    if (newTextsAdded) {
        const textList = document.getElementById('text-list');
        if (textList) {
            console.log(`New texts found (${texts.size} total), re-rendering text filter list...`);
            createFilterList(textList, texts, 'text');
        } else console.error("Text list element (#text-list) not found for update.");
    }

    // Update Family List
    if (newFamiliesAdded) {
        const familyList = document.getElementById('family-list');
        if (familyList) {
            console.log(`New families found (${families.size} total), re-rendering family filter list...`);
            createFilterList(familyList, families, 'family');
        } else console.error("Family list element (#family-list) not found for update.");
    }

    // Update Location List
    if (newLocationsAdded) {
        const locationList = document.getElementById('location-list');
        if (locationList) {
            console.log(`New locations found (${locations.size} total), re-rendering location filter list...`);
            createFilterList(locationList, locations, 'location');
        } else console.error("Location list element (#location-list) not found for update.");
    }

    // Update Legend if new types were added
    if (newEventTypesAdded) {
        if (typeof generateLegend === 'function') {
            console.log("New event types found, re-generating legend...");
            generateLegend(); // Re-run legend generation to include new types/colors
        } else {
            console.error("generateLegend function not available. Cannot update legend with new types.");
        }
    }

    // Optional: Log if no new items were found
    // if (!newTextsAdded && !newFamiliesAdded && !newLocationsAdded && !newEventTypesAdded) {
    //     console.log("No new filter options found in loaded data.");
    // }
}


/**
 * Main function triggered by the "Load More Manuscripts" button.
 * Fetches data for Minuscules and Lectionaries, adds them to the timeline,
 * updates filter options, and re-applies all filters.
 */
async function loadMoreManuscripts() {
    const loadButton = document.getElementById('load-more-manuscripts');
    // Prevent multiple concurrent loads
    if (loadButton && loadButton.disabled) {
        console.log("Load more already in progress or complete.");
        return;
    }
    if (loadButton) {
        loadButton.disabled = true; // Disable button during load
        loadButton.textContent = "Loading...";
    }
    console.log('Loading more manuscripts (Minuscules and Lectionaries)...');

    // Fetch data from the relevant JSON files
    // Consider adding error handling specific to these fetches if needed
    const minusculesData = await fetchAndProcessJSON('JSONS/minuscules.json');
    const lectionariesData = await fetchAndProcessJSON('JSONS/lectionaries.json');

    // Check if any data was actually loaded
    if (minusculesData.length === 0 && lectionariesData.length === 0) {
        console.warn('No additional manuscript data loaded from JSON files.');
        if (loadButton) {
            loadButton.textContent = "No More Data Found"; // Update button text
            // Keep it disabled or optionally hide it: loadButton.style.display = 'none';
        }
        return; // Exit if no new data
    }

    console.log('Additional data loaded successfully:', {
        minuscules: minusculesData.length,
        lectionaries: lectionariesData.length
    });

    // Combine both datasets
    const allNewData = [...minusculesData, ...lectionariesData];

    // --- Perform necessary updates ---
    // 1. Add the new events visually to the timeline
    addEventsToTimelineDisplay(allNewData);

    // 2. Update the global filter sets and the sidebar filter lists
    updateFiltersWithNewData(allNewData);

    // 3. Apply the central filter logic to ALL events (old and new)
    if (typeof applyAllFilters === 'function') {
        console.log("Applying all filters to the combined dataset after load more...");
        applyAllFilters();
    } else {
        console.error("applyAllFilters function is not defined. Cannot re-apply filters.");
    }
    // --- Updates Complete ---


    console.log('Finished processing loaded manuscripts.');
    // Update button state after completion
    if (loadButton) {
        loadButton.textContent = "Manuscripts Loaded";
        // Keep disabled to prevent re-loading, or re-enable if needed
    }
}


// Ensure the DOM is fully loaded before adding the event listener to the button
document.addEventListener('DOMContentLoaded', () => {
    const loadMoreButton = document.getElementById('load-more-manuscripts');
    if (loadMoreButton) {
        // Attach the main loading function to the button's click event
        loadMoreButton.addEventListener('click', loadMoreManuscripts);
    } else {
        console.error('Load More Manuscripts button (#load-more-manuscripts) not found.');
    }
});

// --- END OF FILE load-more.js ---
