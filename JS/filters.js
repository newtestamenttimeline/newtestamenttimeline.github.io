// --- START OF FILE filters.js ---

// Central function to apply ALL active filters to ALL events
function applyAllFilters() {
    console.log("Applying all filters..."); // For debugging

    // --- 1. Get the state of all active filters ---

    // Event Types (from Legend Checkboxes)
    const checkedEventTypes = new Set();
    // Ensure legend checkboxes have 'data-event-type' attribute set in uiControls.js -> generateLegend
    document.querySelectorAll('#legend .legend-checkbox:checked').forEach(cb => {
        if (cb.dataset.eventType) {
            checkedEventTypes.add(cb.dataset.eventType);
        } else {
            console.warn("Legend checkbox missing data-event-type:", cb);
        }
    });
    const eventTypeFilterActive = document.querySelectorAll('#legend .legend-checkbox').length > 0;


    // Texts (from Text List Checkboxes)
    const checkedTexts = new Set();
    document.querySelectorAll('#text-list input[type="checkbox"]:checked').forEach(cb => {
        checkedTexts.add(cb.value);
    });
    // Also get unchecked texts to correctly handle "hide if it contains this unchecked text" logic
    const uncheckedTexts = new Set();
    document.querySelectorAll('#text-list input[type="checkbox"]:not(:checked)').forEach(cb => {
       uncheckedTexts.add(cb.value);
   });
    const textFilterActive = document.querySelectorAll('#text-list input[type="checkbox"]').length > 0;


    // Families (from Family List Checkboxes)
    const checkedFamilies = new Set();
    document.querySelectorAll('#family-list input[type="checkbox"]:checked').forEach(cb => {
        checkedFamilies.add(cb.value);
    });
    // Get unchecked families if needed for specific logic (e.g., hide if unchecked)
     const uncheckedFamilies = new Set();
     document.querySelectorAll('#family-list input[type="checkbox"]:not(:checked)').forEach(cb => {
         uncheckedFamilies.add(cb.value);
     });
    const familyFilterActive = document.querySelectorAll('#family-list input[type="checkbox"]').length > 0;


    // --- 2. Iterate through each event dot ---
    const allEvents = document.querySelectorAll('.event');
    allEvents.forEach(event => {
        let isVisible = true; // Assume visible by default, then set to false if any filter fails

        // Get event data attributes
        const eventType = event.getAttribute('data-event-type');
        const eventFamily = event.getAttribute('data-family') || ''; // Handle events possibly lacking a family
        let eventTexts = [];
        try {
            // Ensure texts are parsed correctly, default to empty array if attribute is missing or invalid
            eventTexts = JSON.parse(event.getAttribute('data-texts') || '[]');
            if (!Array.isArray(eventTexts)) eventTexts = []; // Ensure it's an array
        } catch (e) {
            console.warn(`Could not parse texts for event: ${event.title || 'Untitled Event'}`, e);
            eventTexts = []; // Default to empty on error
        }

        // --- 3. Apply filters sequentially (AND logic - all conditions must pass) ---

        // Filter 1: Event Type
        // If event type filters are active AND this event's type is NOT in the set of checked types
        if (eventTypeFilterActive && !checkedEventTypes.has(eventType)) {
            isVisible = false;
        }

        // Filter 2: Manuscript Family
        // If still visible AND family filters are active AND this event HAS a family AND that family is NOT in the set of checked families
        // if (isVisible && familyFilterActive && eventFamily && !checkedFamilies.has(eventFamily)) {
        //    isVisible = false;
        // }
        // Alternative/Better Logic: Hide if family is unchecked
         if (isVisible && familyFilterActive && eventFamily && uncheckedFamilies.has(eventFamily)) {
             isVisible = false;
         }


        // Filter 3: Texts
        // If still visible AND text filters are active
        if (isVisible && textFilterActive) {
             let containsUnchecked = false;
             // Check if the event contains *any* text that is currently *unchecked*
             for (const text of eventTexts) {
                 if (uncheckedTexts.has(text)) {
                     containsUnchecked = true;
                     break; // Found an unchecked text, no need to check further
                 }
             }

             if (containsUnchecked) {
                 // If it contains any unchecked text, it should be hidden
                 isVisible = false;
             } else {
                 // If it contains NO unchecked texts, then check if it meets the *checked* criteria
                 // (Only relevant if there are actually some texts checked)
                 if (checkedTexts.size > 0 && eventTexts.length > 0) {
                     let matchesChecked = false;
                     // Does it contain at least one of the *checked* texts?
                     for (const text of eventTexts) {
                         if (checkedTexts.has(text)) {
                             matchesChecked = true;
                             break;
                         }
                     }
                     // If it has texts, but none match the currently checked texts, hide it
                     if (!matchesChecked) {
                         isVisible = false;
                     }
                 }
                 // If checkedTexts.size is 0 (meaning all texts are unchecked or no text filters exist),
                 // and it passed the 'containsUnchecked' check, it remains visible.
                 // Also remains visible if eventTexts.length is 0 (event has no texts associated).
             }
        }


        // --- 4. Set visibility based on the final result ---
        event.style.display = isVisible ? 'block' : 'none';
    });

    console.log("Filtering complete.");
}


// Central function to create and append filters to the filter list
// MODIFIED: The callback now always calls applyAllFilters
function createFilterList(filterContainer, filterSet, filterType) { // Added filterType for clarity
    filterContainer.innerHTML = ''; // Clear existing filters

    // Convert Set to Array and sort for consistent order
    const sortedFilterValues = Array.from(filterSet).sort();

    sortedFilterValues.forEach(filterValue => {
        const listItem = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true; // Start checked
        checkbox.value = filterValue;
        checkbox.id = `${filterType}-${filterValue.replace(/\s+/g, '-')}`; // Create unique ID

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = ` ${filterValue}`; // Add space before label text

        // Attach the single event listener to call the central filter function
        checkbox.addEventListener('change', applyAllFilters);

        listItem.appendChild(checkbox);
        listItem.appendChild(label);
        filterContainer.appendChild(listItem);
    });
}

// Initialize all filters (texts, families)
// This function stays largely the same but uses the modified createFilterList
function initializeFilters() {
    const textList = document.getElementById('text-list');
    const familyList = document.getElementById('family-list');
    // Note: eventTypeList initialization is removed as legend handles Event Types

    // Make sure the global sets `texts` and `families` are populated before calling this
    // (Should happen in eventProcessing.js)
    if (textList && texts instanceof Set) {
        createFilterList(textList, texts, 'text'); // Pass 'text' as filterType
    } else {
         console.error("Could not initialize text filters. Element or Set missing.");
    }

    if (familyList && families instanceof Set) {
        createFilterList(familyList, families, 'family'); // Pass 'family' as filterType
    } else {
        console.error("Could not initialize family filters. Element or Set missing.");
    }

    console.log('Filters initialized using createFilterList, listeners point to applyAllFilters.');
}


// --- Deprecated Functions (Keep commented out or remove) ---
/*
// Filter events by text - NO LONGER USED DIRECTLY
function filterEventsByText(text, isChecked) {
    // Logic moved to applyAllFilters
}

// Filter events by family - NO LONGER USED DIRECTLY
function filterEventsByFamily(family, isChecked) {
    // Logic moved to applyAllFilters
}

// Filter events by event type - NO LONGER USED DIRECTLY
function filterEventsByEventType(eventType, isChecked) {
    // Logic moved to applyAllFilters and handled by legend checkboxes
}
*/

// --- END OF FILE filters.js ---
