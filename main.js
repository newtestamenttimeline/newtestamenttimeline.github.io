let isDown = false;
let startX;
let scrollLeft;

document.addEventListener('DOMContentLoaded', function () {
    const timeline = document.getElementById('timeline');
    const timelineContainer = document.getElementById('timeline-container');
    const sidebar = document.getElementById('sidebar');
    const legendContainer = document.getElementById('legend');
    let scale = 1;
    let selectedEvent = null;

    // Initialize progress bar and event loading
    setUpProgressBar();
    loadEvents();

    // Event listener for "Load More Events" button
    const loadMoreButton = document.getElementById('load-more-event-types');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', async () => {
            try {
                const lectionariesEvents = await fetch('lectionaries.json').then(response => response.json());
                const minusculesEvents = await fetch('minuscules.json').then(response => response.json());

                processEvents(lectionariesEvents, minusculesEvents);
                updateEvents();
                initializeFilters(); 
            } catch (error) {
                console.error('Error loading additional events:', error);
            }
        });
    } else {
        console.error('Load More Events button not found.');
    }

    const zoomInButton = document.getElementById('zoom-in');
    const zoomOutButton = document.getElementById('zoom-out');

    function zoomTimeline(zoomFactor) {
        // Adjust the zoom scale
        scale *= zoomFactor;
        timeline.style.transform = `scale(${scale})`;

        // Calculate the scaled width of the timeline
        const scaledWidth = 14000 * scale;
        const leftScrollAdjustment = (scaledWidth - 14000) / 2;

        // Adjust scrollLeft to account for zooming
        timelineContainer.scrollLeft = Math.max(
            Math.min(timelineContainer.scrollLeft + leftScrollAdjustment, scaledWidth - timelineContainer.clientWidth),
            0
        );
    }

    if (zoomInButton) {
        zoomInButton.addEventListener('click', () => {
            zoomTimeline(1.2); // Zoom in
        });
    } else {
        console.error('Zoom In button not found.');
    }

    if (zoomOutButton) {
        zoomOutButton.addEventListener('click', () => {
            zoomTimeline(1 / 1.2); // Zoom out
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

            zoomTimeline(1.2); // Double-click zooms in
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
