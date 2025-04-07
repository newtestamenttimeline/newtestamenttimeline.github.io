// --- START OF FILE main.js ---

let isDown = false; // For drag-to-scroll
let startX;
let scrollLeft;

// Ensure DOM is fully loaded before executing
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded. Initializing main.js...");

    // Get references to essential elements
    const timelineContainer = document.getElementById('timeline-container');
    const timeline = document.getElementById('timeline'); // The actual timeline bar/line
    const bigContainer = document.getElementById('big-container'); // Container holding events and timeline line
    const sidebar = document.getElementById('sidebar');
    const legendContainer = document.getElementById('legend'); // Container for the legend section

    if (!timelineContainer || !timeline || !bigContainer || !sidebar || !legendContainer) {
        console.error("Essential elements (timeline container, timeline, big container, sidebar, legend container) not found. Aborting main.js setup.");
        return;
    }

    let scale = 1; // Initial zoom scale

    // Initialize progress bar visually (function defined in eventProcessing.js)
    if (typeof updateProgressBar === 'function') {
        updateProgressBar(0); // Show bar at 0%
    } else {
        console.warn("updateProgressBar function not found during init.");
    }

    // Start loading initial event data (function defined in eventProcessing.js)
    if (typeof loadEvents === 'function') {
        loadEvents(); // This will fetch data, process, add dots, setup filters/legend, and apply initial filters
    } else {
        console.error("loadEvents function not found. Cannot load timeline data.");
        // Display error to user in the content area
        const contentArea = document.getElementById('event-content');
        if (contentArea) contentArea.innerHTML = "<h2>Initialization Error</h2><p>Could not start the timeline loading process. Please refresh.</p>";
        return; // Stop further setup if loading can't start
    }

    // Add static year labels to the timeline bar (independent of event loading)
    addYearLabels();


    // --- Event Listeners for UI Controls ---

    // Zoom Controls
    const zoomInButton = document.getElementById('zoom-in');
    const zoomOutButton = document.getElementById('zoom-out');
    if (zoomInButton && zoomOutButton && bigContainer) {
        zoomInButton.addEventListener('click', () => {
            scale *= 1.2;
            bigContainer.style.transform = `scale(${scale})`; // Apply zoom using transform
            bigContainer.style.transformOrigin = 'left'; // Zoom from the left edge
             // Maybe re-center view or adjust scroll after zoom?
        });
        zoomOutButton.addEventListener('click', () => {
            scale /= 1.2;
            bigContainer.style.transform = `scale(${scale})`;
            bigContainer.style.transformOrigin = 'left';
        });
    } else {
        console.warn('Zoom buttons or big container not found.');
    }

    // Sidebar Toggle (Main sidebar button is handled in uiControls.js)

    // Legend Section Toggle (Handled dynamically in uiControls.js via button added there)
    // **Correction:** Use event delegation on the static parent container (#legend)
    // This ensures the listener works even though the button is added dynamically.
    legendContainer.addEventListener('click', (event) => {
        // Check if the click target is the toggle button OR the arrow inside it
        const toggleButton = event.target.closest('#toggle-legend-button'); // Use the specific ID from uiControls.js
        if (toggleButton) {
            const list = document.getElementById('legend-list-items');
            const arrow = toggleButton.querySelector('.arrow');
            if (list && arrow) {
                const isCollapsed = list.style.display === 'none';
                list.style.display = isCollapsed ? 'block' : 'none';
                arrow.classList.toggle('collapsed', !isCollapsed);
            } else {
                 console.error("Could not find legend list or arrow for toggling via delegation.");
            }
        }
    });


    // REMOVED Listener for non-existent button #load-more-event-types
    // const loadMoreButton = document.getElementById('load-more-event-types'); // This button does not exist


    // Timeline Drag-to-Scroll Functionality
    if (timelineContainer) {
        timelineContainer.addEventListener('mousedown', (e) => {
            // Prevent drag on buttons or interactive elements inside timeline if needed
            if (e.target.closest('button') || e.target.closest('.event')) return;
            isDown = true;
            timelineContainer.style.cursor = 'grabbing';
            startX = e.pageX - timelineContainer.offsetLeft;
            scrollLeft = timelineContainer.scrollLeft;
        });

        timelineContainer.addEventListener('mouseleave', () => {
            if (isDown) {
                isDown = false;
                timelineContainer.style.cursor = 'grab';
            }
        });

        timelineContainer.addEventListener('mouseup', () => {
            if (isDown) {
                isDown = false;
                timelineContainer.style.cursor = 'grab';
            }
        });

        timelineContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault(); // Prevent text selection during drag
            const x = e.pageX - timelineContainer.offsetLeft;
            const walk = (x - startX) * 2; // Adjust multiplier for scroll speed
            timelineContainer.scrollLeft = scrollLeft - walk;
        });

         // Set initial cursor style
         timelineContainer.style.cursor = 'grab';

        // Optional: Recenter on resize (might be disorienting)
        // new ResizeObserver(() => {
        //     // Recalculate center? This might fight user scrolling.
        // }).observe(timelineContainer);

    } else {
        console.error('Timeline container not found for drag-scroll setup.');
    }

     console.log("main.js initialization complete.");
});


// Function to add static year labels to the timeline bar
function addYearLabels() {
    console.log("addYearLabels() running...");
    const timeline = document.getElementById("timeline"); // Target the timeline bar itself
    if (!timeline) {
        console.error("Timeline element (#timeline) not found for adding year labels.");
        return;
    }
    // Clear existing labels first to prevent duplicates if called multiple times
    timeline.querySelectorAll('.year-label').forEach(label => label.remove());

    const yearLabels = [1, 100, 300, 500, 750, 1000, 1250, 1500, 1750, 2000];
    const minYear = 1;    // Should match positioning logic in eventProcessing.js
    const maxYear = 2000; // Should match positioning logic

    yearLabels.forEach(year => {
        const yearLabel = document.createElement('div');
        yearLabel.className = 'year-label';
        yearLabel.innerText = year;

        // Position based on the same logic used for year-containers
        let leftPercent = ((year - minYear) / (maxYear - minYear)) * 100;
        leftPercent = Math.max(0, Math.min(100, leftPercent));

        yearLabel.style.position = "absolute"; // Position relative to the timeline bar
        yearLabel.style.left = `${leftPercent}%`;
        // yearLabel.style.bottom = "-25px"; // Position below the line (adjust as needed)
        // yearLabel.style.transform = "translateX(-50%)"; // Center the label on the mark

        // console.log(`Adding year label: ${year} at ${leftPercent}%`);
        timeline.appendChild(yearLabel);
    });
}

// --- END OF FILE main.js ---
