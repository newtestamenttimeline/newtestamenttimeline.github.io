// --- START OF FILE uiControls.js ---

const legendContainer = document.getElementById('legend'); // Ensure this is defined
const sidebar = document.getElementById('sidebar'); // Define sidebar if not already global

// Function to toggle the sidebar visibility (assuming sidebar variable is accessible)
function toggleSidebar() {
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    } else {
        console.error("Sidebar element not found for toggling.");
    }
}

// Function to generate the legend with checkboxes that trigger the central filter function
function generateLegend() {
    if (!legendContainer) {
        console.error("Legend container not found.");
        return;
    }
    if (!(eventTypes instanceof Set)) {
         console.error("eventTypes Set is not defined or not a Set.");
         return;
    }

    legendContainer.innerHTML = ''; // Clear previous legend items

    // Create the toggle button for the legend section itself if needed
    // Example: Adding a header and toggle button structure
    const legendHeader = document.createElement('h3');
    legendHeader.textContent = 'Legend';
    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggle-legend';
    toggleButton.setAttribute('aria-label', 'Toggle legend');
    toggleButton.className = 'toggle-legend'; // Use existing class if styled
    toggleButton.innerHTML = '<div class="arrow"></div>'; // Assuming arrow styling exists
    toggleButton.addEventListener('click', () => {
        // Add logic to collapse/expand the list below if desired
        const list = legendContainer.querySelector('ul'); // Assuming items are in a UL
        if (list) list.style.display = list.style.display === 'none' ? 'block' : 'none';
         toggleButton.querySelector('.arrow').classList.toggle('collapsed');
    });

    const headerDiv = document.createElement('div'); // Wrapper for H3 and button if needed
     headerDiv.style.display = 'flex'; // Example layout
     headerDiv.style.alignItems = 'center';
     headerDiv.style.justifyContent = 'space-between';
     headerDiv.appendChild(legendHeader);
     headerDiv.appendChild(toggleButton);
     legendContainer.appendChild(headerDiv);


    const legendList = document.createElement('ul'); // Container for the actual items

    // Sort event types alphabetically for consistent order
    const sortedEventTypes = Array.from(eventTypes).sort();

    sortedEventTypes.forEach(eventType => {
        const legendItem = document.createElement('li'); // Use list items for semantics
        legendItem.className = 'legend-item'; // Use existing class if styled

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'legend-checkbox';
        checkbox.checked = true; // Start checked
        checkbox.id = `legend-checkbox-${eventType}`; // Unique ID
        // *** MODIFICATION: Add data attribute and change listener ***
        checkbox.dataset.eventType = eventType; // Store event type directly on the element
        checkbox.addEventListener('change', applyAllFilters); // Call the central filter function from filters.js

        const legendColor = document.createElement('div');
        legendColor.className = 'legend-color';
        // Ensure getColorForEventType is available (defined in eventProcessing.js or globally)
        legendColor.style.backgroundColor = typeof getColorForEventType === 'function' ? getColorForEventType(eventType) : '#ccc'; // Default color fallback

        const label = document.createElement('label'); // Use label associated with checkbox
        label.htmlFor = checkbox.id;
        // Capitalize first letter for display
        const labelText = eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        label.textContent = ` ${labelText}`; // Add space for visual separation

        // Optional: Re-add question mark and tooltip if desired
        const questionMark = document.createElement('span');
        questionMark.className = 'question-mark';
        questionMark.textContent = '?';
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip';
        // Adjust tooltip text and link as needed
        tooltip.innerHTML = `Show/Hide ${labelText} events. <a href="https://newtestamenttimeline.com/INFOPAGES/manuscript-types.html" target="_blank" rel="noopener noreferrer">Read more</a>`; // Added rel attribute
        questionMark.appendChild(tooltip);

        legendItem.appendChild(checkbox);
        legendItem.appendChild(legendColor);
        legendItem.appendChild(label);
        legendItem.appendChild(questionMark); // Append question mark if using

        legendList.appendChild(legendItem); // Append item to the list
    });

     legendContainer.appendChild(legendList); // Append the list to the main container

    console.log("Legend generated.");

    // Optional: Re-apply colors to existing event dots if needed (though initial load should handle this)
    // const events = document.querySelectorAll('.event');
    // events.forEach(event => {
    //     const type = event.getAttribute('data-event-type');
    //     if (typeof getColorForEventType === 'function' && type) {
    //         event.style.backgroundColor = getColorForEventType(type);
    //     }
    // });
}


// --- Deprecated Function (Remove or comment out) ---
/*
function toggleEventsByType(eventType, isChecked) {
    // This logic is now handled by applyAllFilters in filters.js
    console.log(`Toggling ${eventType}: ${isChecked} - Function deprecated.`);
    // const events = document.querySelectorAll(`.event[data-event-type="${eventType}"]`);
    // events.forEach(event => {
    //     event.style.display = isChecked ? 'block' : 'none';
    // });
}
*/


// Event listener for the top hamburger menu
document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menu-toggle');
    const menuList = document.getElementById('menu-list');

    if (menuToggle && menuList) {
        menuToggle.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent click from immediately closing menu via document listener
            menuList.classList.toggle('hidden');
        });

        // Close the menu when clicking outside of it
        document.addEventListener('click', (e) => {
            // Check if the click is outside the menu AND outside the toggle button
            if (!menuList.contains(e.target) && e.target !== menuToggle && !menuList.classList.contains('hidden')) {
                menuList.classList.add('hidden');
            }
        });
    } else {
        console.error('Menu toggle button or menu list element not found.');
    }

    // Add listener for the main sidebar toggle button if it exists
    const sidebarToggle = document.getElementById('toggle-sidebar');
    if (sidebarToggle && typeof toggleSidebar === 'function') {
         sidebarToggle.addEventListener('click', toggleSidebar);
    } else if (!sidebarToggle) {
        console.error("Sidebar toggle button not found.");
    }

});

// --- END OF FILE uiControls.js ---
