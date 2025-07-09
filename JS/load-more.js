// --- START OF NEW load-more.js ---

// State variables to prevent re-loading data
let minusculesLoaded = false;
let lectionariesLoaded = false;

/**
 * Fetches JSON data from a given URL. (This function can remain as is)
 * @param {string} url - The URL to fetch JSON from.
 * @returns {Promise<Array|[]>}
 */
async function fetchAndProcessJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch data from ${url}: ${response.statusText}`);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching or parsing data from ${url}:`, error);
        return [];
    }
}

/**
 * The main function to dynamically load manuscript data on demand.
 * It's triggered by checking a box in the legend for the first time.
 * @param {string} typeToLoad - The eventType to load, e.g., 'Minuscule' or 'Lectionary'.
 * @param {HTMLElement} labelElement - The <label> element associated with the checkbox for UX feedback.
 */
async function triggerDynamicLoad(typeToLoad, labelElement) {
    let url = '';
    let isAlreadyLoaded = false;
    let stateFlagToSet = () => {};

    // Determine which file to load and check its state
    if (typeToLoad === 'Minuscule') {
        if (minusculesLoaded) isAlreadyLoaded = true;
        url = 'JSONS/minuscules.json';
        stateFlagToSet = () => { minusculesLoaded = true; };
    } else if (typeToLoad === 'Lectionary') {
        if (lectionariesLoaded) isAlreadyLoaded = true;
        url = 'JSONS/lectionaries.json';
        stateFlagToSet = () => { lectionariesLoaded = true; };
    } else {
        console.error(`Unknown type requested for dynamic load: ${typeToLoad}`);
        return; // Exit if the type is not recognized
    }

    // If data is already loaded, do nothing.
    if (isAlreadyLoaded) {
        console.log(`${typeToLoad} data already loaded. Skipping fetch.`);
        return;
    }

    console.log(`[Dynamic Load] Starting fetch for ${typeToLoad}...`);

    // --- Provide UX Feedback ---
    const originalLabelText = labelElement.textContent;
    if (labelElement) {
        labelElement.textContent = `${originalLabelText} (Loading...)`;
    }

    try {
        const newData = await fetchAndProcessJSON(url);

        if (newData.length === 0) {
            console.warn(`[Dynamic Load] No data returned for ${typeToLoad}.`);
            // Mark as "loaded" to prevent future fetch attempts for this session
            stateFlagToSet();
            return;
        }

        console.log(`[Dynamic Load] Data fetched for ${typeToLoad}. Processing...`);

        // Use existing functions to process and display the new data
        addEventsToTimelineDisplay(newData);
        updateFiltersWithNewData(newData);
        applyAllFilters();

        // Mark the data as loaded to prevent re-fetching
        stateFlagToSet();
        console.log(`[Dynamic Load] Finished processing for ${typeToLoad}.`);

    } catch (error) {
        console.error(`[Dynamic Load] A critical error occurred while loading ${typeToLoad}:`, error);
    } finally {
        // --- Restore UX ---
        if (labelElement) {
            labelElement.textContent = originalLabelText;
        }
    }
}

/**
 * Adds newly loaded event data visually to the timeline. (This function can remain as is)
 * @param {Array} data - Array of event objects to add.
 */
function addEventsToTimelineDisplay(data) {
    if (typeof addEventToTimeline !== 'function') return;
    data.forEach(event => {
        if (typeof processEvent === 'function') processEvent(event);
        addEventToTimeline(event);
    });
    if (typeof updateEvents === 'function') updateEvents();
}

/**
 * Updates the global filter Sets with new unique values. (This function can remain as is)
 * @param {Array} data - Array of newly loaded event objects.
 */
function updateFiltersWithNewData(data) {
    // (Your existing robust updateFiltersWithNewData function code goes here)
    // No changes are needed inside this function itself.
    // For brevity, it's omitted here, but you should keep your full version.
    let newTextsAdded = false, newFamiliesAdded = false, newLocationsAdded = false, newEventTypesAdded = false;
    data.forEach(event => {
        if (event.texts && Array.isArray(event.texts)) event.texts.forEach(text => !texts.has(text.trim()) && (texts.add(text.trim()), newTextsAdded = true));
        if (event.family && !families.has(event.family.trim())) families.add(event.family.trim()), newFamiliesAdded = true;
        if (event.location && !locations.has(event.location.trim())) locations.add(event.location.trim()), newLocationsAdded = true;
        if (event.eventType && !eventTypes.has(event.eventType.trim())) eventTypes.add(event.eventType.trim()), newEventTypesAdded = true;
    });
    if (newTextsAdded) createFilterList(document.getElementById('text-list'), texts, 'text');
    if (newFamiliesAdded) createFilterList(document.getElementById('family-list'), families, 'family');
    if (newLocationsAdded) createFilterList(document.getElementById('location-list'), locations, 'location');
    if (newEventTypesAdded && typeof generateLegend === 'function') generateLegend();
}
// --- END OF NEW load-more.js ---
