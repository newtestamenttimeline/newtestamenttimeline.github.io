// Global variables that need to be accessible across different script files
let texts = new Set();
let families = new Set();
let eventTypes = new Set(); 
let eventTypeColors = {
    historical: '#3498db',  // Blue
    uncial: '#e74c3c',      // Red
    Papyrus: '#2ecc71',  // Green
    churchFathers: '#f39c12', // Orange
    Minuscule: '#9b59b6',  // Purple
    lectionary: '#e67e22', // Orange
    // Add or update colors as needed
};


// Function to populate text list
function populateTextList() {
    const textListElement = document.getElementById('text-list');
    if (textListElement) {
        textListElement.innerHTML = ''; // Clear the list first

        texts.forEach(text => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<input type="checkbox" checked> ${text}`;
            listItem.querySelector('input').addEventListener('change', (e) => {
                filterEventsByText(text, e.target.checked);
            });
            textListElement.appendChild(listItem);
        });
    } else {
        console.error('Text list element not found.');
    }
}

// Function to populate family list
function populateFamilyList() {
    const familyListElement = document.getElementById('family-list');
    if (familyListElement) {
        familyListElement.innerHTML = ''; // Clear the list first

        families.forEach(family => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<input type="checkbox" checked> ${family}`;
            listItem.querySelector('input').addEventListener('change', (e) => {
                filterEventsByFamily(family, e.target.checked);
            });
            familyListElement.appendChild(listItem);
        });
    } else {
        console.error('Family list element not found.');
    }
}

// Ensure DOM is fully loaded before executing the rest of the script
document.addEventListener('DOMContentLoaded', function() {
    const timeline = document.getElementById('timeline');
    const timelineContainer = document.getElementById('timeline-container');
    const content = document.getElementById('event-content');
    const sidebar = document.getElementById('sidebar');
    const legendContainer = document.getElementById('legend');
    let scale = 1;
    let selectedEvent = null;

    // Declare variables for drag functionality
    let isDown = false;
    let startX;
    let scrollLeft;

    setUpProgressBar();
    loadEvents();
    initializeFilters();
    generateLegend();
    populateTextList();
    populateFamilyList();

    // Event listener for "Load More Events" button
    const loadMoreButton = document.getElementById('load-more-event-types');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', async () => {
            try {
                const lectionariesEvents = await fetch('lectionaries.json').then(response => response.json());
                const minusculesEvents = await fetch('minuscules.json').then(response => response.json());

                // Process additional events
                processEvents(lectionariesEvents, minusculesEvents);

                // Generate colors for any new event types that were loaded later
                generateColorsForEventTypes();

                // Update the timeline with new events and colors
                updateEvents();
                populateTextList(); // Repopulate text list
                populateFamilyList(); // Repopulate family list
                generateLegend(); // Refresh legend to include new event types with colors
            } catch (error) {
                console.error('Error loading additional events:', error);
            }
        });
    } else {
        console.error('Load More Events button not found.');
    }

    // Add event listeners for UI controls
    const toggleLegendButton = document.getElementById('toggle-legend');
    if (toggleLegendButton) {
        toggleLegendButton.addEventListener('click', () => {
            legendContainer.classList.toggle('collapsed');
            const arrow = document.querySelector('#toggle-legend .arrow');
            arrow.classList.toggle('collapsed');
        });
    } else {
        console.error('Toggle Legend button not found.');
    }

    const toggleSidebarButton = document.getElementById('toggle-sidebar');
    if (toggleSidebarButton) {
        toggleSidebarButton.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            const arrow = document.querySelector('#toggle-sidebar .arrow-reverse');
            arrow.classList.toggle('collapsed');
        });
    } else {
        console.error('Toggle Sidebar button not found.');
    }

    const zoomInButton = document.getElementById('zoom-in');
    if (zoomInButton) {
        zoomInButton.addEventListener('click', () => {
            scale *= 1.2;
            timeline.style.transform = `scale(${scale})`;
        });
    } else {
        console.error('Zoom In button not found.');
    }

    const zoomOutButton = document.getElementById('zoom-out');
    if (zoomOutButton) {
        zoomOutButton.addEventListener('click', () => {
            scale /= 1.2;
            timeline.style.transform = `scale(${scale})`;
        });
    } else {
        console.error('Zoom Out button not found.');
    }

    if (timelineContainer) {
        timelineContainer.addEventListener('dblclick', (e) => {
            const rect = timelineContainer.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const targetPercentage = offsetX / rect.width;
            const targetScroll = targetPercentage * timeline.scrollWidth * scale - rect.width / 2;

            timelineContainer.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });

            scale *= 1.2;
            timeline.style.transform = `scale(${scale})`;
        });

        timelineContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - timelineContainer.offsetLeft;
            scrollLeft = timelineContainer.scrollLeft;
        });

        timelineContainer.addEventListener('mouseleave', () => {
            isDown = false;
        });

        timelineContainer.addEventListener('mouseup', () => {
            isDown = false;
        });

        timelineContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - timelineContainer.offsetLeft;
            const walk = (x - startX) * 3;
            timelineContainer.scrollLeft = scrollLeft - walk;
        });

        new ResizeObserver(() => {
            timelineContainer.scrollLeft = (timeline.scrollWidth - timelineContainer.clientWidth) / 2;
        }).observe(timelineContainer);
    } else {
        console.error('Timeline container not found.');
    }
});

// Function to set up the progress bar
function setUpProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = '0%';
    } else {
        console.error('Progress bar element not found.');
    }
}

// Function to update the progress bar
function updateProgressBar(progress) {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = progress + '%';
    } else {
        console.error('Progress bar element not found.');
    }
}

// Load events and update the timeline
async function loadEvents() {
    try {
        const totalFiles = 4; // Number of JSON files to load
        let filesLoaded = 0;

        // Fetch and process initial events
        const historicalEvents = await fetch('historical_events.json').then(response => response.json());
        filesLoaded++;
        updateProgressBar((filesLoaded / totalFiles) * 100);

        const manuscriptEvents = await fetch('manuscripts.json').then(response => response.json());
        filesLoaded++;
        updateProgressBar((filesLoaded / totalFiles) * 100);

        const uncialsEvents = await fetch('uncials.json').then(response => response.json());
        filesLoaded++;
        updateProgressBar((filesLoaded / totalFiles) * 100);

        const churchFathersEvents = await fetch('church_fathers.json').then(response => response.json());
        filesLoaded++;
        updateProgressBar((filesLoaded / totalFiles) * 100);

        // Process initial events
        processEvents(historicalEvents, manuscriptEvents, uncialsEvents, churchFathersEvents);

        // Initial updates
        generateColorsForEventTypes();
        updateEvents();
        initializeFilters();
        populateTextList();
        populateFamilyList();
        generateLegend();

    } catch (error) {
        console.error('Error loading events:', error);
    }
}
