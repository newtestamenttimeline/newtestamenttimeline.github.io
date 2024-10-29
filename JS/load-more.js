// JavaScript to load events from JSON files and update the UI!

// Function to fetch and process JSON data
async function fetchAndProcessJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch data from ${url}: ${response.statusText}`);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}: ${error}`);
        return [];
    }
}

// Function to add events to the timeline using DocumentFragment for batch updates
function addEventsToTimeline(data) {
    const timelineContainer = document.getElementById('timeline');
    if (!timelineContainer) {
        console.error('Timeline container not found.');
        return;
    }

    // Use a DocumentFragment to batch event dot creation and appending
    const fragment = document.createDocumentFragment();

    data.forEach(event => {
        const eventDot = document.createElement('div');
        eventDot.className = 'event';
        eventDot.title = event.title || 'Event';

        eventDot.setAttribute('data-event-type', event.eventType || '');
        eventDot.setAttribute('data-texts', JSON.stringify(event.texts || []));
        eventDot.setAttribute('data-family', event.family || '');

        const eventType = event.eventType;
        eventDot.style.backgroundColor = eventTypeColors[eventType] || 'yellow';

        // Adjusted position calculation to match initial load exactly
        const newLeft = ((event.year - 0) / 2100) * 100;
        eventDot.style.left = `${newLeft}%`;

        const yOffset = parseFloat(event.y) || 0;
        eventDot.style.top = `calc(50% + ${yOffset}px)`;

        // Attach click event listener for showing event details
        eventDot.addEventListener('click', () => {
            document.getElementById('event-content').innerHTML = `
                <h2>${event.title || 'Event'}</h2>
                <p>${event.description || 'No description available.'}</p>
                <p><strong>Year:</strong> ${event.year}</p>
                <p><strong>Texts:</strong> ${event.texts.join(', ') || 'N/A'}</p>
                <p><strong>Family:</strong> ${event.family || 'N/A'}</p>
                <p><strong>Location:</strong> ${event.location || 'N/A'}</p>
                <p><strong>Event Type:</strong> ${event.eventType || 'N/A'}</p>
            `;
        });

        fragment.appendChild(eventDot);
    });

    // Append all event dots at once
    timelineContainer.appendChild(fragment);

    // Ensure year labels are visible on the timeline
    document.querySelectorAll('.year-label').forEach(label => {
        timelineContainer.appendChild(label);
    });
}


// Function to update filters using DocumentFragment for batch updates
function updateFilters(data) {
    const textList = document.getElementById('text-list');
    const familyList = document.getElementById('family-list');

    // Store existing filters to avoid duplication
    const existingTexts = new Set(Array.from(textList.querySelectorAll('li')).map(li => li.textContent.trim()));
    const existingFamilies = new Set(Array.from(familyList.querySelectorAll('li')).map(li => li.textContent.trim()));

    const textFragment = document.createDocumentFragment();
    const familyFragment = document.createDocumentFragment();

    data.forEach(event => {
        // Add unique texts
        event.texts.forEach(text => {
            if (text && !existingTexts.has(text)) {  // Only add if not already in the list
                const listItem = document.createElement('li');
                listItem.innerHTML = `<input type="checkbox" checked value="${text}"> ${text}`;
                const checkbox = listItem.querySelector('input');
                checkbox.addEventListener('change', (e) => {
                    filterEventsByText(e.target.value, e.target.checked);
                });
                textFragment.appendChild(listItem);
                existingTexts.add(text);  // Mark as added
            }
        });

        // Add unique families
        if (event.family && !existingFamilies.has(event.family)) {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<input type="checkbox" checked value="${event.family}"> ${event.family}`;
            const checkbox = listItem.querySelector('input');
            checkbox.addEventListener('change', (e) => {
                filterEventsByFamily(e.target.value, e.target.checked);
            });
            familyFragment.appendChild(listItem);
            existingFamilies.add(event.family);  // Mark as added
        }
    });

    // Append all list items at once
    textList.appendChild(textFragment);
    familyList.appendChild(familyFragment);
}

// Function to apply active filters selectively based on the current state
function applyActiveFilters() {
    const activeTextFilters = document.querySelectorAll('#text-list input[type="checkbox"]:checked');
    activeTextFilters.forEach(checkbox => {
        filterEventsByText(checkbox.value, checkbox.checked);
    });

    const activeFamilyFilters = document.querySelectorAll('#family-list input[type="checkbox"]:checked');
    activeFamilyFilters.forEach(checkbox => {
        filterEventsByFamily(checkbox.value, checkbox.checked);
    });

    const activeEventTypeFilters = document.querySelectorAll('#event-type-list input[type="checkbox"]:checked');
    activeEventTypeFilters.forEach(checkbox => {
        toggleEventsByType(checkbox.value, checkbox.checked);
    });
}

// Main function to load more manuscripts
async function loadMoreManuscripts() {
    console.log('Loading more manuscripts...');
    const minusculesData = await fetchAndProcessJSON('/JSONS/minuscules.json');
    const lectionariesData = await fetchAndProcessJSON('/JSONS/lectionaries.json');

    if (minusculesData.length === 0 && lectionariesData.length === 0) {
        console.error('No data loaded from JSON files.');
        return;
    }

    console.log('Data loaded successfully:', {
        minuscules: minusculesData.length,
        lectionaries: lectionariesData.length
    });

    // Combine both data sets
    const allData = [...minusculesData, ...lectionariesData];

    // Add events to the timeline
    addEventsToTimeline(allData);

    // Update filters after adding events
    updateFilters(allData);

    // Apply active filters to the newly added events
    applyActiveFilters();

    console.log('Filters updated and events added to the timeline.');
}

// Ensure the DOM is fully loaded before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
    const loadMoreButton = document.getElementById('load-more-manuscripts');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', loadMoreManuscripts);
    } else {
        console.error('Load More Manuscripts button not found.');
    }
});
