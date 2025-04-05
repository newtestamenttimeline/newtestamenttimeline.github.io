// --- START OF FILE filters.js ---

// Central function to apply ALL active filters to ALL events
function applyAllFilters() {
    // console.log("Applying all filters..."); // For debugging

    // --- 1. Get the state of all active filters ---

    // Event Types (from Legend Checkboxes)
    const checkedEventTypes = new Set();
    document.querySelectorAll('#legend .legend-checkbox:checked').forEach(cb => {
        if (cb.dataset.eventType) checkedEventTypes.add(cb.dataset.eventType);
    });
    // No need for unchecked types here, logic is "show if checked"

    // Texts (from Text List Checkboxes)
    const checkedTexts = new Set();
    document.querySelectorAll('#text-list input[type="checkbox"]:checked').forEach(cb => {
        checkedTexts.add(cb.value);
    });
    const uncheckedTexts = new Set(); // Need unchecked to hide events containing them
    document.querySelectorAll('#text-list input[type="checkbox"]:not(:checked)').forEach(cb => {
       uncheckedTexts.add(cb.value);
    });
    const textFilterActive = document.querySelectorAll('#text-list input[type="checkbox"]').length > 0;

    // Families (from Family List Checkboxes)
    const checkedFamilies = new Set(); // Not directly used if using "hide if unchecked" logic below
    document.querySelectorAll('#family-list input[type="checkbox"]:checked').forEach(cb => {
        checkedFamilies.add(cb.value);
    });
    const uncheckedFamilies = new Set(); // Need unchecked to hide events with these families
    document.querySelectorAll('#family-list input[type="checkbox"]:not(:checked)').forEach(cb => {
        uncheckedFamilies.add(cb.value);
    });
    const familyFilterActive = document.querySelectorAll('#family-list input[type="checkbox"]').length > 0;


    // *** NEW: Locations (from Location List Checkboxes) ***
    const checkedLocations = new Set(); // Not directly used if using "hide if unchecked"
     document.querySelectorAll('#location-list input[type="checkbox"]:checked').forEach(cb => {
         checkedLocations.add(cb.value);
     });
    const uncheckedLocations = new Set(); // Need unchecked to hide events with these locations
    document.querySelectorAll('#location-list input[type="checkbox"]:not(:checked)').forEach(cb => {
        uncheckedLocations.add(cb.value);
    });
    const locationFilterActive = document.querySelectorAll('#location-list input[type="checkbox"]').length > 0;


    // --- 2. Iterate through each event dot ---
    const allEvents = document.querySelectorAll('.event');
    allEvents.forEach(event => {
        let isVisible = true; // Assume visible

        // Get event data attributes
        const eventType = event.getAttribute('data-event-type');
        const eventFamily = event.getAttribute('data-family') || '';
        const eventLocation = event.getAttribute('data-location') || ''; // *** NEW: Get location ***
        let eventTexts = [];
        try {
            eventTexts = JSON.parse(event.getAttribute('data-texts') || '[]');
            if (!Array.isArray(eventTexts)) eventTexts = [];
        } catch (e) { eventTexts = []; }


        // --- 3. Apply filters sequentially (AND logic) ---

        // Filter 1: Event Type (Show only if type is checked)
        // Note: No need for eventTypeFilterActive check if we assume legend always exists
        if (!checkedEventTypes.has(eventType)) {
            isVisible = false;
        }

        // Filter 2: Manuscript Family (Hide if family is present AND unchecked)
        if (isVisible && familyFilterActive && eventFamily && uncheckedFamilies.has(eventFamily)) {
            isVisible = false;
        }

        // Filter 3: Texts (Hide if event contains ANY unchecked text)
        if (isVisible && textFilterActive) {
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
            // Optional refinement: if NO texts are checked, should events with texts be hidden?
            // Current logic: They remain visible if they don't contain unchecked texts.
        }

        // *** NEW: Filter 4: Location (Hide if location is present AND unchecked) ***
         if (isVisible && locationFilterActive && eventLocation && uncheckedLocations.has(eventLocation)) {
             isVisible = false;
         }


        // --- 4. Set visibility ---
        event.style.display = isVisible ? 'block' : 'none';
    });

    // console.log("Filtering complete."); // For debugging
}


// Central function to create and append filters to a list container
function createFilterList(filterContainer, filterSet, filterType) {
    if (!filterContainer) {
        console.error(`Filter container not found for type: ${filterType}`);
        return;
    }
    if (!(filterSet instanceof Set)) {
         console.error(`Invalid filterSet provided for type: ${filterType}`);
         return;
    }

    filterContainer.innerHTML = ''; // Clear existing

    const sortedFilterValues = Array.from(filterSet).sort((a, b) => a.localeCompare(b)); // Alphabetical sort

    sortedFilterValues.forEach(filterValue => {
        const listItem = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true; // Start checked
        checkbox.value = filterValue;
        // Create a more robust ID based on type and value
        const safeValue = filterValue.replace(/[^a-zA-Z0-9-_]/g, ''); // Make value safe for ID
        checkbox.id = `filter-${filterType}-${safeValue}`;

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = ` ${filterValue}`; // Space before label

        checkbox.addEventListener('change', applyAllFilters); // Central listener

        listItem.appendChild(checkbox);
        listItem.appendChild(label);
        filterContainer.appendChild(listItem);
    });
}

// Initialize all sidebar filter lists (texts, families, locations)
function initializeFilters() {
    const textList = document.getElementById('text-list');
    const familyList = document.getElementById('family-list');
    const locationList = document.getElementById('location-list'); // *** NEW: Get location list ***

    // Initialize Text Filters
    if (textList && typeof texts === 'object' && texts instanceof Set) {
        createFilterList(textList, texts, 'text');
    } else { console.error("Could not initialize text filters."); }

    // Initialize Family Filters
    if (familyList && typeof families === 'object' && families instanceof Set) {
        createFilterList(familyList, families, 'family');
    } else { console.error("Could not initialize family filters."); }

    // *** NEW: Initialize Location Filters ***
    if (locationList && typeof locations === 'object' && locations instanceof Set) {
        createFilterList(locationList, locations, 'location');
    } else { console.error("Could not initialize location filters."); }


    console.log('Sidebar filters initialized (Texts, Families, Locations).');
}

// --- END OF FILE filters.js ---
