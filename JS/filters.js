// --- START OF FILE filters.js ---

function applyAllFilters() {
    // console.log("Applying all filters...");

    // ...(Get filter states - no changes needed here)...
    let checkedEventTypes = new Set();
    let checkedTexts = new Set();
    let uncheckedTexts = new Set();
    let uncheckedFamilies = new Set();
    let uncheckedLocations = new Set();
    let textFilterActive = false;
    let familyFilterActive = false;
    let locationFilterActive = false;
    let eventTypeFilterActive = false;

    try {
        document.querySelectorAll('#legend .legend-checkbox:checked').forEach(cb => {
            if (cb.dataset.eventType) checkedEventTypes.add(cb.dataset.eventType);
        });
        eventTypeFilterActive = document.querySelectorAll('#legend .legend-checkbox').length > 0;
        document.querySelectorAll('#text-list input[type="checkbox"]:checked').forEach(cb => checkedTexts.add(cb.value));
        document.querySelectorAll('#text-list input[type="checkbox]:not(:checked)').forEach(cb => uncheckedTexts.add(cb.value));
        textFilterActive = document.querySelectorAll('#text-list input[type="checkbox"]').length > 0;
        document.querySelectorAll('#family-list input[type="checkbox"]:not(:checked)').forEach(cb => uncheckedFamilies.add(cb.value));
        familyFilterActive = document.querySelectorAll('#family-list input[type="checkbox"]').length > 0;
        document.querySelectorAll('#location-list input[type="checkbox"]:not(:checked)').forEach(cb => uncheckedLocations.add(cb.value));
        locationFilterActive = document.querySelectorAll('#location-list input[type="checkbox"]').length > 0;
    } catch (error) {
        console.error("Error reading filter states:", error);
        return;
    }


    const allEvents = document.querySelectorAll('.event');
    allEvents.forEach(event => {
        let isVisible = true;
        const eventTitle = event.getAttribute('title') || 'Untitled'; // For logging

        const eventType = event.getAttribute('data-event-type') || '';
        const eventFamily = event.getAttribute('data-family') || '';
        const eventLocation = event.getAttribute('data-location') || '';
        let eventTexts = [];
        try {
            const textsAttr = event.getAttribute('data-texts');
            eventTexts = textsAttr ? JSON.parse(textsAttr) : [];
            if (!Array.isArray(eventTexts)) eventTexts = [];
        } catch (e) { eventTexts = []; }

        // --- Apply filters ---

        // Event Type
        if (eventTypeFilterActive && !checkedEventTypes.has(eventType)) {
            isVisible = false;
        }

        // Family
        if (isVisible && familyFilterActive && eventFamily && uncheckedFamilies.has(eventFamily)) {
            isVisible = false;
        }

        // *** MODIFIED: Text Filter with Debugging ***
        if (isVisible && textFilterActive && eventTexts.length > 0) {
            const hasUnchecked = eventTexts.some(text => uncheckedTexts.has(text));
            // --- Debugging Lines ---
            // Uncomment below to log detailed info for ONE specific event when testing texts
            // if (eventTitle === "Papyrus46") { // Or pick another event title
            //     console.log(`--- Text Filter Debug (${eventTitle}) ---`);
            //     console.log(`  isVisible Before: ${isVisible}`);
            //     console.log(`  textFilterActive: ${textFilterActive}`);
            //     console.log(`  eventTexts: [${eventTexts.join(', ')}]`);
            //     console.log(`  uncheckedTexts:`, uncheckedTexts);
            //     console.log(`  hasUnchecked: ${hasUnchecked}`);
            // }
            // --- End Debugging ---
            if (hasUnchecked) {
                isVisible = false; // Hide if it contains an unchecked text
            }
        }


        // Location
        if (isVisible && locationFilterActive && eventLocation && uncheckedLocations.has(eventLocation)) {
            isVisible = false;
        }

        // Set visibility
        event.style.display = isVisible ? 'block' : 'none';
    });
    // console.log("Filtering complete.");
}


// createFilterList (No changes needed from previous version)
function createFilterList(filterContainer, filterSet, filterType) {
    // ... (previous correct code) ...
    if (!filterContainer) {
        console.error(`Filter container element not found for type: ${filterType}`); return;
    }
    if (!(filterSet instanceof Set)) {
        console.error(`Invalid filterSet (not a Set) provided for type: ${filterType}`); return;
    }
    filterContainer.innerHTML = '';
    const sortedFilterValues = Array.from(filterSet).sort((a, b) => a.localeCompare(b));
    if (sortedFilterValues.length === 0) { return; }
    sortedFilterValues.forEach(filterValue => {
        const listItem = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.value = filterValue;
        const safeValue = String(filterValue).replace(/[^a-zA-Z0-9-_]/g, '') || 'empty';
        checkbox.id = `filter-${filterType}-${safeValue}`;
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = ` ${filterValue}`;
        checkbox.addEventListener('change', applyAllFilters);
        listItem.appendChild(checkbox);
        listItem.appendChild(label);
        filterContainer.appendChild(listItem);
    });
}

// initializeFilters (No changes needed from previous version with logging)
function initializeFilters() {
    // ... (previous correct code with logging) ...
    console.log("Initializing sidebar filters...");
    const textList = document.getElementById('text-list');
    const familyList = document.getElementById('family-list');
    const locationList = document.getElementById('location-list');

    const setsReady =
        typeof texts === 'object' && texts instanceof Set &&
        typeof families === 'object' && families instanceof Set &&
        typeof locations === 'object' && locations instanceof Set;

    if (!setsReady) {
         console.error("One or more global filter Sets (texts, families, locations) are not ready during initialization.");
    }

    if (textList && typeof texts === 'object' && texts instanceof Set) {
        console.log(`Initializing Texts (${texts.size} items)`);
        createFilterList(textList, texts, 'text');
    } else {
        console.error("Could not initialize text filters. List Element:", textList, "Set:", texts);
    }

    if (familyList && typeof families === 'object' && families instanceof Set) {
        console.log(`Initializing Families (${families.size} items)`);
        createFilterList(familyList, families, 'family');
    } else {
        console.error("Could not initialize family filters. List Element:", familyList, "Set:", families);
    }

    if (locationList && typeof locations === 'object' && locations instanceof Set) {
        console.log(`Initializing Locations (${locations.size} items)`);
        createFilterList(locationList, locations, 'location');
    } else {
        if (!locationList) console.error("Location list container (#location-list) not found.");
        if (!(typeof locations === 'object' && locations instanceof Set)) console.error("Global 'locations' Set is not ready or not a Set:", locations);
        console.error("Could not initialize location filters.");
    }
    console.log('Sidebar filters initialization attempt complete.');
}

// --- END OF FILE filters.js ---
