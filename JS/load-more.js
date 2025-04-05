// --- START OF FILE load-more.js ---

// Helper function to fetch JSON (no changes)
async function fetchAndProcessJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch data from ${url}: ${response.statusText} (${response.status})`);
            return [];
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json();
        } else {
            console.error(`Received non-JSON response from ${url}. Content-Type: ${contentType}`);
            return [];
        }
    } catch (error) {
        console.error(`Error fetching or parsing data from ${url}:`, error);
        return [];
    }
}

// Function to add newly loaded events to the timeline display (no changes)
function addEventsToTimelineDisplay(data) {
    if (typeof addEventToTimeline !== 'function') {
        console.error("Function addEventToTimeline is not defined."); return;
    }
    if (!Array.isArray(data)) {
        console.error("Invalid data passed to addEventsToTimelineDisplay."); return;
    }
    console.log(`Adding ${data.length} new events to the timeline display.`);
    data.forEach(event => {
        if (typeof processEvent === 'function') processEvent(event);
        addEventToTimeline(event);
    });
    console.log("Finished adding new events to display.");

    // Re-run updateEvents to add click listeners to new AND old events (simplest way)
    if (typeof updateEvents === 'function') {
        console.log("Updating event listeners for all events after load more...");
        updateEvents();
    }
}

// Function to update filter lists with new unique items from loaded data
function updateFiltersWithNewData(data) {
    if (!Array.isArray(data)) {
        console.error("Invalid data passed to updateFiltersWithNewData."); return;
    }
    // Ensure global Sets exist
    if (!(typeof texts === 'object' && texts instanceof Set) ||
        !(typeof families === 'object' && families instanceof Set) ||
        !(typeof locations === 'object' && locations instanceof Set) || // *** NEW: Check locations Set ***
        !(typeof eventTypes === 'object' && eventTypes instanceof Set)) {
        console.error("Global filter Sets (texts, families, locations, eventTypes) not available.");
        return;
    }

    let newTextsAdded = false;
    let newFamiliesAdded = false;
    let newLocationsAdded = false; // *** NEW: Track new locations ***
    let newEventTypesAdded = false; // Track new types

    console.log("Checking for new filter options in loaded data...");
    data.forEach(event => {
        // Update Texts
        if (event.texts && Array.isArray(event.texts)) {
            event.texts.forEach(text => {
                if (text && text.trim() !== '' && !texts.has(text)) {
                    texts.add(text.trim()); newTextsAdded = true;
                }
            });
        }
        // Update Families
        if (event.family && event.family.trim() !== '' && !families.has(event.family)) {
            families.add(event.family.trim()); newFamiliesAdded = true;
        }
        // *** NEW: Update Locations ***
        if (event.location && event.location.trim() !== '' && !locations.has(event.location)) {
            locations.add(event.location.trim()); newLocationsAdded = true;
        }
        // Update Event Types
        if (event.eventType && event.eventType.trim() !== '' && !eventTypes.has(event.eventType)) {
             eventTypes.add(event.eventType.trim()); newEventTypesAdded = true;
             console.warn(`New event type "${event.eventType}" added dynamically. Ensure color exists.`);
             // Optionally regenerate legend or colors here if needed
        }
    });

    // Re-render filter lists ONLY IF new items were added
    if (newTextsAdded && typeof createFilterList === 'function') {
        const textList = document.getElementById('text-list');
        if (textList) {
            console.log("New texts found, re-rendering text filter list...");
            createFilterList(textList, texts, 'text');
        }
    }
    if (newFamiliesAdded && typeof createFilterList === 'function') {
        const familyList = document.getElementById('family-list');
        if (familyList) {
            console.log("New families found, re-rendering family filter list...");
            createFilterList(familyList, families, 'family');
        }
    }
    // *** NEW: Re-render Location list ***
    if (newLocationsAdded && typeof createFilterList === 'function') {
        const locationList = document.getElementById('location-list');
        if (locationList) {
            console.log("New locations found, re-rendering location filter list...");
            createFilterList(locationList, locations, 'location');
        }
    }
     if (newEventTypesAdded && typeof generateLegend === 'function') {
         console.log("New event types found, re-generating legend...");
         generateLegend(); // Regenerate legend to include new type(s)
     }

    if (!newTextsAdded && !newFamiliesAdded && !newLocationsAdded && !newEventTypesAdded) {
        console.log("No new filter options found in loaded data.");
    }
}


// Main function to load more manuscripts
async function loadMoreManuscripts() {
    const loadButton = document.getElementById('load-more-manuscripts');
    if (loadButton && loadButton.disabled) return; // Prevent multiple loads
    if (loadButton) loadButton.disabled = true;
    console.log('Loading more manuscripts (Minuscules and Lectionaries)...');

    const minusculesData = await fetchAndProcessJSON('JSONS/minuscules.json');
    const lectionariesData = await fetchAndProcessJSON('JSONS/lectionaries.json');

    if (minusculesData.length === 0 && lectionariesData.length === 0) {
        console.warn('No additional manuscript data loaded.');
        if (loadButton) loadButton.textContent = "No More Data";
        return;
    }

    console.log('Additional data loaded:', { minuscules: minusculesData.length, lectionaries: lectionariesData.length });
    const allNewData = [...minusculesData, ...lectionariesData];

    // 1. Add events visually
    addEventsToTimelineDisplay(allNewData);

    // 2. Update filter sets and sidebar lists
    updateFiltersWithNewData(allNewData);

    // 3. Apply central filter logic to the entire dataset
    if (typeof applyAllFilters === 'function') {
        console.log("Applying all filters to the combined dataset after load more...");
        applyAllFilters();
    } else { console.error("applyAllFilters function is not defined."); }

    console.log('Finished processing loaded manuscripts.');
    if (loadButton) {
        loadButton.textContent = "Manuscripts Loaded";
        // Optionally hide completely: loadButton.style.display = 'none';
    }
}

// Event listener for the load more button
document.addEventListener('DOMContentLoaded', () => {
    const loadMoreButton = document.getElementById('load-more-manuscripts');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', loadMoreManuscripts);
    } else {
        console.error('Load More Manuscripts button (#load-more-manuscripts) not found.');
    }
});

// --- END OF FILE load-more.js ---
