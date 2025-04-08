// --- START filters.js -> applyAllFilters ---

function applyAllFilters() {
    // console.log("Applying all filters..."); // Optional general log

    // 1. Get Filter States
    let checkedEventTypes = new Set();
    let checkedTexts = new Set();
    let uncheckedTexts = new Set(); // <--- We need this Set
    let uncheckedFamilies = new Set();
    let uncheckedLocations = new Set();
    let textFilterActive = false;
    let familyFilterActive = false;
    let locationFilterActive = false;
    let eventTypeFilterActive = false;

    try {
        // ... (Get states for Event Types, Families, Locations - no changes needed here) ...
        document.querySelectorAll('#legend .legend-checkbox:checked').forEach(cb => {
            if (cb.dataset.eventType) checkedEventTypes.add(cb.dataset.eventType);
        });
        eventTypeFilterActive = document.querySelectorAll('#legend .legend-checkbox').length > 0;

        // --- Get Text Filter State ---
        document.querySelectorAll('#text-list input[type="checkbox"]:checked').forEach(cb => checkedTexts.add(cb.value));
        document.querySelectorAll('#text-list input[type="checkbox]:not(:checked)').forEach(cb => uncheckedTexts.add(cb.value)); // Populate uncheckedTexts
        textFilterActive = document.querySelectorAll('#text-list input[type="checkbox"]').length > 0;
        // *** DEBUG LOG 1: Check the UNCHECKED Texts Set ***
        // console.log("Debug - Unchecked Texts Set:", uncheckedTexts);
        // *** END LOG 1 ***

        document.querySelectorAll('#family-list input[type="checkbox"]:not(:checked)').forEach(cb => uncheckedFamilies.add(cb.value));
        familyFilterActive = document.querySelectorAll('#family-list input[type="checkbox"]').length > 0;
        document.querySelectorAll('#location-list input[type="checkbox"]:not(:checked)').forEach(cb => uncheckedLocations.add(cb.value));
        locationFilterActive = document.querySelectorAll('#location-list input[type="checkbox"]').length > 0;

    } catch (error) {
        console.error("Error reading filter states:", error);
        return;
    }


    // 2. Iterate Through Events
    const allEvents = document.querySelectorAll('.event');
    allEvents.forEach(event => {
        let isVisible = true;
        const eventTitle = event.getAttribute('title') || 'Untitled';

        const eventType = event.getAttribute('data-event-type') || '';
        const eventFamily = event.getAttribute('data-family') || '';
        const eventLocation = event.getAttribute('data-location') || '';
        let eventTexts = []; // Array to hold texts for this specific event dot

        // --- Parse data-texts ---
        let parseError = false;
        try {
            const textsAttr = event.getAttribute('data-texts');
            // *** DEBUG LOG 2: Check raw data-texts attribute ***
            // if (eventTitle === "Papyrus4") { // Target specific event
            //     console.log(`Debug (${eventTitle}) - Raw data-texts attribute:`, textsAttr);
            // }
             // *** END LOG 2 ***
            eventTexts = textsAttr ? JSON.parse(textsAttr) : [];
            if (!Array.isArray(eventTexts)) {
                 // If parse result isn't an array, treat as error/empty
                 console.warn(`Parsed data-texts for ${eventTitle} is not an array:`, eventTexts);
                 eventTexts = [];
                 parseError = true;
            }
             // *** DEBUG LOG 3: Check parsed eventTexts array ***
            // if (eventTitle === "Papyrus4") {
            //     console.log(`Debug (${eventTitle}) - Parsed eventTexts array:`, eventTexts);
            // }
            // *** END LOG 3 ***
        } catch (e) {
             console.error(`*** DEBUG: Failed to parse data-texts for event: ${eventTitle}`, e, "Attribute was:", event.getAttribute('data-texts'));
             eventTexts = [];
             parseError = true;
        }
        // --- End Parse ---


        // --- Apply Filters Sequentially ---

        // Event Type (no changes needed)
        if (eventTypeFilterActive && !checkedEventTypes.has(eventType)) {
            isVisible = false;
        }

        // Family (no changes needed)
        if (isVisible && familyFilterActive && eventFamily && uncheckedFamilies.has(eventFamily)) {
            isVisible = false;
        }

        // --- Apply Text Filter ---
        if (isVisible && textFilterActive && eventTexts.length > 0 && !parseError) {
             // *** DEBUG LOG 4: Check BEFORE the .some() comparison ***
            // if (eventTitle === "Papyrus4") {
            //     console.log(`Debug (${eventTitle}) - Entering .some() check. isVisible: ${isVisible}, eventTexts:`, eventTexts, `uncheckedTexts:`, uncheckedTexts);
            // }
            // *** END LOG 4 ***

            const hasUnchecked = eventTexts.some(textFromArray => {
                const isUnchecked = uncheckedTexts.has(textFromArray);
                 // *** DEBUG LOG 5: Check EACH comparison inside .some() ***
                // if (eventTitle === "Papyrus4") {
                //     console.log(`   ...Comparing textFromArray: "${textFromArray}" with uncheckedTexts. Result: ${isUnchecked}`);
                // }
                // *** END LOG 5 ***
                return isUnchecked;
            });

             // *** DEBUG LOG 6: Check the RESULT of the .some() comparison ***
            // if (eventTitle === "Papyrus4") {
            //     console.log(`Debug (${eventTitle}) - Result of .some() check (hasUnchecked): ${hasUnchecked}`);
            // }
            // *** END LOG 6 ***

            if (hasUnchecked) {
                isVisible = false; // Hide if any text matches an unchecked one
            }
        } else if (isVisible && parseError) {
             // Optional: Decide how to handle events where data-texts failed parsing
             // console.log(`Event ${eventTitle} kept visible despite text filter activity due to parse error.`);
        }
        // --- End Text Filter ---


        // Location (no changes needed)
        if (isVisible && locationFilterActive && eventLocation && uncheckedLocations.has(eventLocation)) {
            isVisible = false;
        }


        // 3. Set Final Visibility
        // *** DEBUG LOG 7: Final decision for the event ***
        // if (eventTitle === "Papyrus4") {
        //     console.log(`Debug (${eventTitle}) - Final isVisible: ${isVisible}. Setting display to: ${isVisible ? 'block' : 'none'}`);
        // }
        // *** END LOG 7 ***
        event.style.display = isVisible ? 'block' : 'none';

    }); // End event loop

    // console.log("Filtering complete."); // Optional overall log
}

// --- Rest of filters.js (createFilterList, initializeFilters) ---
// ...(No changes needed in these functions from the previous correct version)...
function createFilterList(filterContainer, filterSet, filterType) {
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
function initializeFilters() {
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
