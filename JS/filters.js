// --- START OF FILE filters.js ---

// Central function to apply ALL active filters to ALL events
function applyAllFilters() {
    // console.log("Applying all filters...");

    // --- 1. Get the state of all active filters ---
    // Use try-catch blocks for robustness in case elements don't exist yet

    let checkedEventTypes = new Set();
    try {
        document.querySelectorAll('#legend .legend-checkbox:checked').forEach(cb => {
            if (cb.dataset.eventType) checkedEventTypes.add(cb.dataset.eventType);
        });
    } catch (e) { console.error("Error getting checked event types:", e); }

    let checkedTexts = new Set();
    let uncheckedTexts = new Set();
    let textFilterActive = false;
    try {
        document.querySelectorAll('#text-list input[type="checkbox"]:checked').forEach(cb => checkedTexts.add(cb.value));
        document.querySelectorAll('#text-list input[type="checkbox]:not(:checked)').forEach(cb => uncheckedTexts.add(cb.value));
        textFilterActive = document.querySelectorAll('#text-list input[type="checkbox"]').length > 0;
    } catch (e) { console.error("Error getting text filters:", e); }

        // filters.js - Problem Area (Lines ~29-34 in previous code)

    let uncheckedFamilies = new Set(); // Line ~29
    let familyFilterActive = false; // Line ~30 <-- Error Reported Here
    try { // Line ~31
        document.querySelectorAll('#family-list input[type="checkbox"]:not(:checked)').forEach(cb => uncheckedFamilies.add(cb.value)); // Line 32
        familyFilterActive = document.querySelectorAll('#family-list input[type="checkbox"]').length > 0; // Line 33
    } catch (e) { console.error("Error getting family filters:", e); } // Line 34


    let uncheckedLocations = new Set();
    let locationFilterActive = false;
    try {
        document.querySelectorAll('#location-list input[type="checkbox]:not(:checked)').forEach(cb => uncheckedLocations.add(cb.value));
        locationFilterActive = document.querySelectorAll('#location-list input[type="checkbox"]').length > 0;
    } catch (e) { console.error("Error getting location filters:", e); }


    // --- 2. Iterate through each event dot ---
    const allEvents = document.querySelectorAll('.event');
    // console.log(`Filtering ${allEvents.length} events. Checked types: ${checkedEventTypes.size}`); // Debugging

    allEvents.forEach(event => {
        let isVisible = true; // Start assuming visible

        // Get event data attributes safely
        const eventType = event.getAttribute('data-event-type') || '';
        const eventFamily = event.getAttribute('data-family') || '';
        const eventLocation = event.getAttribute('data-location') || '';
        let eventTexts = [];
        try {
            const textsAttr = event.getAttribute('data-texts');
            if (textsAttr) {
                eventTexts = JSON.parse(textsAttr);
                if (!Array.isArray(eventTexts)) eventTexts = [];
            }
        } catch (e) { eventTexts = []; /* Default to empty on error */ }


        // --- 3. Apply filters sequentially (AND logic) ---

        // Filter 1: Event Type (MUST be in the set of checked types)
        // Only apply if the legend checkboxes have been generated
        if (document.querySelectorAll('#legend .legend-checkbox').length > 0 && !checkedEventTypes.has(eventType)) {
            isVisible = false;
        }

        // Filter 2: Manuscript Family (Hide if family exists AND is in the unchecked set)
        if (isVisible && familyFilterActive && eventFamily && uncheckedFamilies.has(eventFamily)) {
            isVisible = false;
        }

        // Filter 3: Texts (Hide if event contains ANY text from the unchecked set)
        if (isVisible && textFilterActive && eventTexts.length > 0) {
            let containsUnchecked = false;
            for (const text of eventTexts) {
                if (uncheckedTexts.has(text)) {
                    containsUnchecked = true;
                    break;
                }
            }
            if (containsUnchecked) {
                isVisible = false;
            }
        }

        // Filter 4: Location (Hide if location exists AND is in the unchecked set)
        if (isVisible && locationFilterActive && eventLocation && uncheckedLocations.has(eventLocation)) {
            isVisible = false;
        }


        // --- 4. Set visibility ---
        event.style.display = isVisible ? 'block' : 'none';
    });

    // console.log("Filtering complete.");
}


// Central function to create and append filters to a list container (no changes needed from previous version)
function createFilterList(filterContainer, filterSet, filterType) {
    if (!filterContainer) {
        console.error(`Filter container not found for type: ${filterType}`); return;
    }
    if (!(filterSet instanceof Set)) {
        console.error(`Invalid filterSet provided for type: ${filterType}`); return;
    }
    filterContainer.innerHTML = '';
    const sortedFilterValues = Array.from(filterSet).sort((a, b) => a.localeCompare(b));
    sortedFilterValues.forEach(filterValue => {
        const listItem = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.value = filterValue;
        const safeValue = String(filterValue).replace(/[^a-zA-Z0-9-_]/g, ''); // Ensure value is safe
        checkbox.id = `filter-${filterType}-${safeValue || 'empty'}`; // Handle empty strings

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = ` ${filterValue}`;

        checkbox.addEventListener('change', applyAllFilters); // Central listener

        listItem.appendChild(checkbox);
        listItem.appendChild(label);
        filterContainer.appendChild(listItem);
    });
}

// Initialize all sidebar filter lists (no changes needed from previous version)
function initializeFilters() {
    const textList = document.getElementById('text-list');
    const familyList = document.getElementById('family-list');
    const locationList = document.getElementById('location-list');

    if (textList && typeof texts === 'object' && texts instanceof Set) {
        createFilterList(textList, texts, 'text');
    } else { console.error("Could not initialize text filters."); }

    if (familyList && typeof families === 'object' && families instanceof Set) {
        createFilterList(familyList, families, 'family');
    } else { console.error("Could not initialize family filters."); }

    if (locationList && typeof locations === 'object' && locations instanceof Set) {
        createFilterList(locationList, locations, 'location');
    } else { console.error("Could not initialize location filters."); }

    console.log('Sidebar filters initialized (Texts, Families, Locations).');
}

// --- END OF FILE filters.js ---
