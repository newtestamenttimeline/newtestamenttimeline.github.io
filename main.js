let isDown = false;
let startX;
let scrollLeft;
let originalTimelineWidth = 14000; // Original width in pixels
let scale = 1; // Initial zoom level

document.addEventListener('DOMContentLoaded', function () {
    const timeline = document.getElementById('timeline');
    const timelineContainer = document.getElementById('timeline-container');
    const sidebar = document.getElementById('sidebar');
    const legendContainer = document.getElementById('legend');
    let selectedEvent = null;

    // Initialize progress bar and event loading
    setUpProgressBar();
    loadEvents(); // This function is now called from eventProcessing.js

    // Event listener for "Load More Events" button
    const loadMoreButton = document.getElementById('load-more-event-types');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', async () => {
            try {
                const lectionariesEvents = await fetch('lectionaries.json').then(response => response.json());
                const minusculesEvents = await fetch('minuscules.json').then(response => response.json());

                // Process additional events (handled by eventProcessing.js)
                processEvents(lectionariesEvents, minusculesEvents);

                // Update the timeline and UI
                updateEvents();
                initializeFilters(); // Refresh filters with the newly loaded events

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

    // Zoom In
    const zoomInButton = document.getElementById('zoom-in');
    if (zoomInButton) {
        zoomInButton.addEventListener('click', () => {
            scale *= 1.2;
            timeline.style.transform = `scale(${scale})`;
            adjustScrollPositionAfterZoom();
        });
    } else {
        console.error('Zoom In button not found.');
    }

    // Zoom Out
    const zoomOutButton = document.getElementById('zoom-out');
    if (zoomOutButton) {
        zoomOutButton.addEventListener('click', () => {
            scale /= 1.2;
            timeline.style.transform = `scale(${scale})`;
            adjustScrollPositionAfterZoom();
        });
    } else {
        console.error('Zoom Out button not found.');
    }

    if (timelineContainer) {
        // Double-click zoom logic
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
            adjustScrollPositionAfterZoom();
        });

        // Mouse drag for scrolling
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

    // Adjust the scroll position after zooming to ensure left side remains visible
    function adjustScrollPositionAfterZoom() {
        const scrollOffset = timelineContainer.scrollLeft / scale;
        timelineContainer.scrollLeft = scrollOffset;
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
