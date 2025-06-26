// --- START OF FILE filters.js ---

// Define New Testament canonical order for sorting text filters
const ntOrder = [
    "Matthew", "Mark", "Luke", "John", "Acts",
    "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
    "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
    "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James",
    "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation",
    // Add any other expected non-canonical categories here if you want them ordered specifically
    "Translation", // Example
    "Gnostic or so-called New testament Apocrypha texts", // Example
    "Preserved in later works" // Example
    // Any text not in this list will be sorted alphabetically at the end
];

// Function applyAllFilters()... (keep existing code)
function applyAllFilters() {
    // ... existing code ...
}

function applyAllFilters() {
    // console.log("Applying all filters..."); // Optional

    // 1. Get Filter States
    let checkedEventTypes = new Set();
    let checkedTexts = new Set(); // Keep track of checked ones too, just in case
    let uncheckedTexts = new Set();
    let uncheckedFamilies = new Set();
    let uncheckedLocations = new Set();
    let textFilterActive = false;
    let familyFilterActive = false;
    let locationFilterActive = false;
    let eventTypeFilterActive = false;

    // --- REPLACED TRY BLOCK START ---
    try {
        // Get Event Type State (remains the same)
        checkedEventTypes.clear(); // Clear at start
        document.querySelectorAll('#legend .legend-checkbox:checked').forEach(cb => {
            if (cb.dataset.eventType) checkedEventTypes.add(cb.dataset.eventType);
        });
        eventTypeFilterActive = document.querySelectorAll('#legend .legend-checkbox').length > 0;

        // --- Get Text Filter State with More Logging ---
        checkedTexts.clear(); // Clear sets at the start of the function run
        uncheckedTexts.clear();

        const allTextBoxes = document.querySelectorAll('#text-list input[type="checkbox"]'); // Get ALL text boxes
        console.log(`Debug - Found ${allTextBoxes.length} total text checkboxes.`); // Log how many were found

        if (allTextBoxes.length > 0) { // Only iterate if checkboxes were found
            allTextBoxes.forEach(cb => {
                // For EACH checkbox, log its state and value
                console.log(`   Checkbox Value: "${cb.value}", Checked State: ${cb.checked}`);
                if (cb.checked) {
                    checkedTexts.add(cb.value);
                } else {
                    uncheckedTexts.add(cb.value); // Add to unchecked set if not checked
                }
            });
            textFilterActive = true; // Set active flag if checkboxes exist
        } else {
            console.log("Debug - No text checkboxes found in #text-list.");
            textFilterActive = false;
        }

        // *** DEBUG LOG 1 (Now after loop): Check the UNCHECKED Texts Set ***
        console.log("Debug - Populated Unchecked Texts Set:", uncheckedTexts);
        // *** END LOG 1 ***

        // Get Family Filter State (remains the same)
        uncheckedFamilies.clear(); // Clear at start
        document.querySelectorAll('#family-list input[type="checkbox"]:not(:checked)').forEach(cb => uncheckedFamilies.add(cb.value));
        familyFilterActive = document.querySelectorAll('#family-list input[type="checkbox"]').length > 0;

        // Get Location Filter State (remains the same)
        uncheckedLocations.clear(); // Clear at start
        document.querySelectorAll('#location-list input[type="checkbox"]:not(:checked)').forEach(cb => uncheckedLocations.add(cb.value));
        locationFilterActive = document.querySelectorAll('#location-list input[type="checkbox"]').length > 0;

    } catch (error) {
        console.error("Error reading filter states:", error);
        // Consider stopping execution if filter state reading fails
        return;
    }
    // --- REPLACED TRY BLOCK END ---


    // 2. Iterate Through Events (No changes needed in this part from previous version)
    const allEvents = document.querySelectorAll('.event');
    allEvents.forEach(event => {
        let isVisible = true;
        const eventTitle = event.getAttribute('title') || 'Untitled';

        const eventType = event.getAttribute('data-event-type') || '';
        const eventFamily = event.getAttribute('data-family') || '';
        const eventLocation = event.getAttribute('data-location') || '';
        let eventTexts = [];

        // --- Parse data-texts --- (No changes needed here)
        let parseError = false;
        try {
            const textsAttr = event.getAttribute('data-texts');
            eventTexts = textsAttr ? JSON.parse(textsAttr) : [];
            if (!Array.isArray(eventTexts)) {
                 eventTexts = []; parseError = true; // Treat non-array as error
            }
        } catch (e) { eventTexts = []; parseError = true; }
        // --- End Parse ---

        // --- Apply Filters Sequentially --- (No changes needed here)
        // Event Type
        if (eventTypeFilterActive && !checkedEventTypes.has(eventType)) { isVisible = false; }
        // Family
        if (isVisible && familyFilterActive && eventFamily && uncheckedFamilies.has(eventFamily)) { isVisible = false; }
        // Texts
        if (isVisible && textFilterActive && eventTexts.length > 0 && !parseError) {
            const hasUnchecked = eventTexts.some(textFromArray => uncheckedTexts.has(textFromArray));
            if (hasUnchecked) { isVisible = false; }
        }
        // Location
        if (isVisible && locationFilterActive && eventLocation && uncheckedLocations.has(eventLocation)) { isVisible = false; }
        // --- End Apply Filters ---

        // 3. Set Final Visibility (No changes needed here)
        event.style.display = isVisible ? 'block' : 'none';

    }); // End event loop

    // console.log("Filtering complete."); // Optional overall log
} // --- End applyAllFilters ---


// Inside filters.js

function createFilterList(filterContainer, filterSet, filterType) {
    // ... (checks for container and set) ...
    filterContainer.innerHTML = '';

    // --- MODIFIED SORTING ---
    let sortedFilterValues;
    if (filterType === 'text') { // <<< Apply custom sort ONLY for texts
        sortedFilterValues = Array.from(filterSet).sort((a, b) => {
            const indexA = ntOrder.indexOf(a);
            const indexB = ntOrder.indexOf(b);

            if (indexA === -1 && indexB === -1) { // Both not in ntOrder, sort alphabetically
                return a.localeCompare(b);
            } else if (indexA === -1) { // a is not in list, put it after b
                return 1;
            } else if (indexB === -1) { // b is not in list, put it before a
                return -1;
            } else { // Both are in the list, sort by index
                return indexA - indexB;
            }
        });
        console.log("Applied NT order sort to Texts filter list."); // For confirmation
    } else { // <<< Use default alphabetical sort for other types
        sortedFilterValues = Array.from(filterSet).sort((a, b) => a.localeCompare(b));
    }
    // --- END MODIFIED SORTING ---


    if (sortedFilterValues.length === 0) { return; }

    sortedFilterValues.forEach(filterValue => {
        // ... (rest of the function creating li, checkbox, label remains the same) ...
         const listItem = document.createElement('li');
         const checkbox = document.createElement('input');
         checkbox.type = 'checkbox';
         checkbox.checked = true; // Keep default checked for list generation
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
