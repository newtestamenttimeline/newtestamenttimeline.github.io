// --- START OF FILE load-more.js ---

// Helper function to fetch and process JSON data
async function fetchAndProcessJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch data from ${url}: ${response.statusText} (${response.status})`);
            return []; // Return empty array on fetch error
        }
        // Check content type before parsing
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json();
        } else {
             console.error(`Received non-JSON response from ${url}. Content-Type: ${contentType}`);
             const text = await response.text();
             console.error("Response text:", text); // Log the actual response
             return [];
        }
    } catch (error) {
        console.error(`Error fetching or parsing data from ${url}:`, error);
        return []; // Return empty array on network or parsing error
    }
}

// Function to add newly loaded events to the timeline display
// Assumes addEventToTimeline function exists (likely in eventProcessing.js)
// and handles creating/finding year containers and appending events.
function addEventsToTimelineDisplay(data) {
    if (typeof addEventToTimeline !== 'function') {
        console.error("Function addEventToTimeline is not defined. Cannot add events.");
        return;
    }
    if (!Array.isArray(data)) {
        console.error("Data passed to addEventsToTimelineDisplay is not an array.");
        return;
    }

    console.log(`Adding ${data.length} new events to the timeline display.`);
    data.forEach(event => {
        // Optional: Process event if needed (e.g., calculate year from range)
        // This might be better handled within addEventToTimeline or processEvent if structure is consistent
        if (typeof processEvent === 'function') {
             processEvent(event); // Ensure year/percentage is set if needed by addEventToTimeline
        }
        // Call the function (likely from eventProcessing.js) that handles adding a single event visually
        addEventToTimeline(event);
    });
     console.log("Finished adding new events to display.");

     // We also need to add click listeners to the newly added events
     // updateEvents (from eventProcessing.js) might need adjustment or re-running
     // Option 1: Re-run updateEvents (might be slightly inefficient if many events exist)
      if (typeof updateEvents === 'function') {
         console.log("Updating event listeners for all events...");
         updateEvents();
      }
     // Option 2: Modify updateEvents to only add listeners to new events (more complex)
     // Option 3: Add listener directly in addEventToTimeline (requires modification there)

}

// Function to update filter lists (Texts, Families) with new unique items from loaded data
// Assumes createFilterList function exists (in filters.js) and handles adding items.
function updateFiltersWithNewData(data) {
     if (!Array.isArray(data)) {
        console.error("Data passed to updateFiltersWithNewData is not an array.");
        return;
    }
    if (!(typeof texts === 'object' && texts instanceof Set) || !(typeof families === 'object' && families instanceof Set)) {
         console.error("Global 'texts' or 'families' Set not available for updating filters.");
         return;
    }

    let newTextsAdded = false;
    let newFamiliesAdded = false;

    console.log("Checking for new filter options in loaded data...");
    data.forEach(event => {
        // Update Texts Set
        if (event.texts && Array.isArray(event.texts)) {
            event.texts.forEach(text => {
                if (text && text.trim() !== '' && !texts.has(text)) {
                    texts.add(text);
                    newTextsAdded = true;
                }
            });
        }
        // Update Families Set
        if (event.family && event.family.trim() !== '' && !families.has(event.family)) {
            families.add(event.family);
            newFamiliesAdded = true;
        }
        // Update Event Types Set (though less common to add types dynamically here)
         if (event.eventType && !(typeof eventTypes === 'object' && eventTypes instanceof Set && eventTypes.has(event.eventType))) {
            if (typeof eventTypes === 'object' && eventTypes instanceof Set) {
                eventTypes.add(event.eventType);
                // Consider regenerating legend if new types are added, or handle dynamically
                console.warn(`New event type "${event.eventType}" added. Legend might need update.`);
            }
         }
    });

    // Re-render filter lists IF new items were actually added
    if (newTextsAdded && typeof initializeFilters === 'function') {
        console.log("New texts found, re-initializing text filters...");
         const textList = document.getElementById('text-list');
         if (textList) createFilterList(textList, texts, 'text'); // Re-render only text list
    }
     if (newFamiliesAdded && typeof initializeFilters === 'function') {
        console.log("New families found, re-initializing family filters...");
        const familyList = document.getElementById('family-list');
         if (familyList) createFilterList(familyList, families, 'family'); // Re-render only family list
    }

     if (!newTextsAdded && !newFamiliesAdded) {
        console.log("No new filter options found in loaded data.");
     }
}

// Main function to load more manuscripts (Minuscules, Lectionaries)
async function loadMoreManuscripts() {
    const loadButton = document.getElementById('load-more-manuscripts');
    if (loadButton) loadButton.disabled = true; // Prevent multiple clicks
    console.log('Loading more manuscripts (Minuscules and Lectionaries)...');

    // Fetch data from the JSON files
    const minusculesData = await fetchAndProcessJSON('JSONS/minuscules.json');
    const lectionariesData = await fetchAndProcessJSON('JSONS/lectionaries.json');

    if (minusculesData.length === 0 && lectionariesData.length === 0) {
        console.warn('No additional manuscript data loaded from JSON files.');
         if (loadButton) {
             loadButton.textContent = "No More Data"; // Update button text
             // Keep disabled or hide it
         }
        return; // Exit if no data
    }

    console.log('Additional data loaded successfully:', {
        minuscules: minusculesData.length,
        lectionaries: lectionariesData.length
    });

    // Combine both data sets
    const allNewData = [...minusculesData, ...lectionariesData];

    // 1. Add the new events to the timeline display
    addEventsToTimelineDisplay(allNewData);

    // 2. Update the global filter sets (texts, families) and re-render filter lists if needed
    updateFiltersWithNewData(allNewData);

    // 3. Apply the central filter logic to ALL events (old and new)
    // *** MODIFICATION: Call the central filter function ***
    if (typeof applyAllFilters === 'function') {
        console.log("Applying all filters to the combined dataset...");
        applyAllFilters();
    } else {
        console.error("applyAllFilters function is not defined. Cannot apply filters.");
    }


    console.log('Finished processing loaded manuscripts.');
    if (loadButton) {
         // Optional: Update button text or hide it after loading
         loadButton.textContent = "Manuscripts Loaded";
         // Or hide: loadButton.style.display = 'none';
    }
}

// --- Deprecated Function (Remove or comment out) ---
/*
function applyActiveFilters() {
    // This logic is now handled by applyAllFilters in filters.js
    console.log("applyActiveFilters function deprecated.");
    // const activeTextFilters = document.querySelectorAll('#text-list input[type="checkbox"]:checked');
    // ... rest of old logic ...
}
*/


// Ensure the DOM is fully loaded before adding event listeners
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
