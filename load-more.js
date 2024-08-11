// JavaScript to load events from JSON files and update the UI

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

// Function to add events to the timeline
function addEventsToTimeline(data) {
    const timelineContainer = document.getElementById('timeline');
    if (!timelineContainer) {
        console.error('Timeline container not found.');
        return;
    }

    data.forEach(event => {
        // Create a dot for each event
        const eventDot = document.createElement('div');
        eventDot.className = 'event-dot';
        eventDot.title = event.title || 'Event';

        // Assign the correct color based on the event type
        const eventType = event.eventType;
        if (eventTypeColors[eventType]) {
            eventDot.style.backgroundColor = eventTypeColors[eventType];
        } else {
            eventDot.style.backgroundColor = 'yellow'; // Fallback color
        }

        // Position the dot on the timeline based on the event year and y coordinate
        const yearPercentage = ((event.year - 0) / (1400 - 0)) * 100;
        eventDot.style.left = `${yearPercentage}%`;

        // Use the 'y' value to position vertically
        const yOffset = parseFloat(event.y) || 0;
        eventDot.style.top = `calc(50% + ${yOffset}px)`;

        // Add a tooltip for the event details
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

        timelineContainer.appendChild(eventDot);
    });
}

// Function to update filters
function updateFilters(data, textList, familyList) {
    data.forEach(event => {
        // Check and add new texts to the text list
        event.texts.forEach(text => {
            if (text && !textList.includes(text)) {
                textList.push(text);
                const li = document.createElement('li');
                li.textContent = text;
                document.getElementById('text-list').appendChild(li);
            }
        });

        // Check and add new families to the family list
        if (event.family && !familyList.includes(event.family)) {
            familyList.push(event.family);
            const li = document.createElement('li');
            li.textContent = event.family;
            document.getElementById('family-list').appendChild(li);
        }
    });
}

// Function to apply active filters to newly loaded events
function applyActiveFilters() {
    const textCheckboxes = document.querySelectorAll('#text-list input[type="checkbox"]');
    textCheckboxes.forEach(checkbox => {
        filterEventsByText(checkbox.parentElement.textContent.trim(), checkbox.checked);
    });

    const familyCheckboxes = document.querySelectorAll('#family-list input[type="checkbox"]');
    familyCheckboxes.forEach(checkbox => {
        filterEventsByFamily(checkbox.parentElement.textContent.trim(), checkbox.checked);
    });
}

// Main function to load more manuscripts
async function loadMoreManuscripts() {
    console.log('Loading more manuscripts...');
    const minusculesData = await fetchAndProcessJSON('minuscules.json');
    const lectionariesData = await fetchAndProcessJSON('lectionaries.json');

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
    const textList = Array.from(document.getElementById('text-list').children).map(item => item.textContent);
    const familyList = Array.from(document.getElementById('family-list').children).map(item => item.textContent);

    updateFilters(allData, textList, familyList);

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
