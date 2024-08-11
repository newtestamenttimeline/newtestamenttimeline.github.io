// Global variables that need to be accessible across different script files

// Ensure DOM is fully loaded before executing the rest of the script
document.addEventListener('DOMContentLoaded', function() {
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
            const legend = document.getElementById('legend');
            legend.classList.toggle('collapsed');
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
});
