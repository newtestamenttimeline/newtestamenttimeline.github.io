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

    // Map of event type to color
    const eventTypeToColor = getEventTypeColors();

    data.forEach(event => {
        // Create a dot for each event
        const eventElement = document.createElement('div');
        eventElement.className = 'event';
        eventElement.title = event.title || 'Event';

        // Position the dot on the timeline based on the event year and y coordinate
        const yearPercentage = ((event.year - 0) / (1400 - 0)) * 100;
        eventElement.style.left = `${yearPercentage}%`;

        // Use the 'y' value to position vertically
        const yOffset = parseFloat(event.y) || 0;
        eventElement.style.top = `calc(50% + ${yOffset}px)`;

        // Assign color based on event type
        const color = eventTypeToColor[event.eventType] || 'gray'; // Default to gray if no color found
        eventElement.style.backgroundColor = color;

        // Add a tooltip for the event details
        eventElement.addEventListener('click', () => {
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

        timelineContainer.appendChild(eventElement);
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

// Function to extract colors from the legend
function getEventTypeColors() {
    const colors = {};
    document.querySelectorAll('.legend .legend-item').forEach(item => {
        const eventType = item.querySelector('.legend-label').textContent.trim();
        const colorElement = item.querySelector('.legend-color');
        const color = colorElement ? colorElement.style.backgroundColor : null;
        if (color) {
            colors[eventType] = color;
        }
    });
    return colors;
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
