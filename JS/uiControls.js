// --- START OF FILE uiControls.js ---

const legendContainer = document.getElementById('legend');
const sidebar = document.getElementById('sidebar');

// Function to toggle the main sidebar visibility
function toggleSidebar() {
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        const arrow = document.querySelector('#toggle-sidebar .arrow-reverse');
        if (arrow) {
            arrow.classList.toggle('collapsed');
        }
    } else {
        console.error("Sidebar element not found for toggling.");
    }
}

// Function to generate the legend with specific order, tooltips, and collapse functionality
// --- START uiControls.js -> generateLegend Function ---

// Function to generate the legend with specific order, tooltips, and collapse functionality
function generateLegend() {
    const legendContainer = document.getElementById('legend'); // Target the container div

    // --- Pre-checks ---
    if (!legendContainer) {
        console.error("Legend container element (#legend) not found.");
        return; // Cannot proceed without the container
    }
    // Ensure eventTypes Set is populated before proceeding
    if (!(typeof eventTypes === 'object' && eventTypes instanceof Set && eventTypes.size > 0)) {
        console.error("Cannot generate legend: eventTypes Set is not defined, not a Set, or is empty.");
        legendContainer.innerHTML = '<h3>Manuscript Types</h3><p>No types available to display.</p>'; // Provide feedback
        return;
    }
    // Ensure required filtering function exists globally
    if (typeof applyAllFilters !== 'function') {
        console.error("Cannot generate legend: applyAllFilters function is not defined.");
        return;
    }
     // Ensure required color function exists globally
    if (typeof getColorForEventType !== 'function') {
        console.error("Cannot generate legend: getColorForEventType function is not defined.");
        // We can proceed but colors might default to grey
    }
    // --- End Pre-checks ---


    legendContainer.innerHTML = ''; // Clear previous content safely

    // --- Define Custom Order and Tooltips ---
    const legendOrder = [
        'Papyrus', 'Uncial', 'Minuscule', 'Lectionary',
        'Church_father', 'Historical', 'Extrabiblical', 'Likely_writing_date'
    ];
    const legendTooltips = {
        'Papyrus': 'Early manuscript fragments written on papyrus material.',
        'Uncial': 'Manuscripts written in large, capital Greek letters (uncials), typically on parchment.',
        'Minuscule': 'Manuscripts written in smaller, cursive Greek letters (minuscules), common later.',
        'Lectionary': 'Manuscripts containing Scripture readings arranged for liturgical use.',
        'Church_father': 'Writings or significant events related to early Church Fathers.',
        'Historical': 'Broader historical events relevant to the context of the manuscripts.',
        'Extrabiblical': 'Significant non-canonical texts or writings from the period.',
        'Likely_writing_date': 'Estimated date range for the original composition of a New Testament book.'
        // Add default tooltip for unexpected types later if needed
    };
    // --- End Definitions ---


    // --- Filter and Sort eventTypes based on custom order ---
    const sortedEventTypes = Array.from(eventTypes)
        .filter(type => legendOrder.includes(type)) // Include only types in our defined order
        .sort((a, b) => legendOrder.indexOf(a) - legendOrder.indexOf(b)); // Sort by index in legendOrder

     // Add any types found in the data but not in our explicit order to the end
     Array.from(eventTypes).forEach(type => {
         if (!legendOrder.includes(type)) {
             sortedEventTypes.push(type);
             console.warn(`Event type "${type}" found but not in custom legend order. Added to end.`);
             // Add a default tooltip if one doesn't exist
             if (!legendTooltips[type]) legendTooltips[type] = `Events categorized as ${type}.`;
         }
     });
    // --- End Sorting ---


    // --- Create Header and Toggle Button for Legend Section ---
    const headerDiv = document.createElement('div');
    headerDiv.style.display = 'flex';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.justifyContent = 'space-between';
    headerDiv.style.marginBottom = '5px';

    const legendHeader = document.createElement('h3');
    legendHeader.textContent = 'Manuscript Types '; // Header text
    const headerTooltipSpan = document.createElement('span'); // Tooltip for the header itself
    headerTooltipSpan.className = 'question-mark';
    headerTooltipSpan.innerHTML = `? <span class="tooltip">Filter events by their general category.</span>`;
    legendHeader.appendChild(headerTooltipSpan); // Add tooltip icon to header

    const toggleButton = document.createElement('button'); // Button to collapse/expand
    toggleButton.id = 'toggle-legend-button'; // Specific ID
    toggleButton.setAttribute('aria-label', 'Toggle Manuscript Types visibility');
    toggleButton.className = 'toggle-legend'; // Class for styling
    toggleButton.style.background = 'none'; // Basic styling reset
    toggleButton.style.border = 'none';
    toggleButton.style.padding = '0 5px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.innerHTML = '<div class="arrow"></div>'; // Arrow for visual state

    headerDiv.appendChild(legendHeader);
    headerDiv.appendChild(toggleButton);
    legendContainer.appendChild(headerDiv); // Add header/toggle container first
    // --- End Header ---


    // --- Create List Container for Legend Items ---
    const legendList = document.createElement('ul'); // UL to hold the list items
    legendList.id = 'legend-list-items'; // Assign ID for easy targeting by toggle button
    legendList.style.paddingLeft = '0'; // Remove default browser padding
    legendList.style.listStyle = 'none'; // Remove default bullets
    legendList.style.margin = '0'; // Reset margin
    legendList.style.display = 'block'; // Start expanded
    // --- End List Container ---


    // --- Populate List with Legend Items ---
    sortedEventTypes.forEach(eventType => {
        const legendItem = document.createElement('li'); // Create list item
        legendItem.className = 'legend-item'; // Assign class for styling

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'legend-checkbox'; // Class for styling/selection
        // *** THIS IS THE KEY CHANGE FOR DEFAULT STATE ***
                // *** THIS IS THE MODIFIED LINE ***
        checkbox.checked = (
            eventType === 'Papyrus' ||
            eventType === 'Uncial' ||
            eventType === 'Historical'      // Added
        ); // Check these types by default
        // *** END KEY CHANGE ***
        checkbox.id = `legend-checkbox-${eventType}`; // Unique ID for label association
        checkbox.dataset.eventType = eventType; // Store type for filtering logic
        checkbox.addEventListener('change', applyAllFilters); // Trigger central filter on change

        // Color Swatch
        const legendColor = document.createElement('div');
        legendColor.className = 'legend-color'; // Class for styling
        legendColor.style.backgroundColor = getColorForEventType(eventType); // Get color using helper function

        // Label
        const label = document.createElement('label');
        label.htmlFor = checkbox.id; // Associate label with checkbox
        // Format label text nicely (replace underscores, capitalize words)
        const labelText = eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        label.textContent = ` ${labelText}`; // Add leading space

        // Tooltip
        const questionMark = document.createElement('span');
        questionMark.className = 'question-mark'; // Class for styling
        questionMark.textContent = '?';
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip'; // Class for styling/visibility
        // Use specific tooltip from object, or generate a default one
        tooltip.textContent = legendTooltips[eventType] || `Information about ${labelText}.`;
        questionMark.appendChild(tooltip); // Add tooltip text to the question mark span

        // Append elements to the list item in order
        legendItem.appendChild(checkbox);
        legendItem.appendChild(legendColor);
        legendItem.appendChild(label);
        legendItem.appendChild(questionMark);

        // Append the complete list item to the UL
        legendList.appendChild(legendItem);
    });
    // --- End List Population ---

    // Append the populated list to the main legend container
    legendContainer.appendChild(legendList);

    // --- Add Toggle Functionality to the Button ---
    toggleButton.addEventListener('click', () => {
        const list = document.getElementById('legend-list-items'); // Find the list by ID
        if (list) {
            const isCollapsed = list.style.display === 'none'; // Check current state
            list.style.display = isCollapsed ? 'block' : 'none'; // Toggle display
            // Update arrow direction based on new state
            const arrowDiv = toggleButton.querySelector('.arrow');
            if (arrowDiv) {
                arrowDiv.classList.toggle('collapsed', !isCollapsed);
            }
        } else {
            console.error("Could not find legend list (#legend-list-items) to toggle.");
        }
    });
    // --- End Toggle ---

    console.log("Legend generated successfully with default states and custom order.");
}

// --- END uiControls.js -> generateLegend Function ---


// Event listener for the top hamburger menu (no changes)
document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menu-toggle');
    const menuList = document.getElementById('menu-list');

    if (menuToggle && menuList) {
        menuToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            menuList.classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!menuList.contains(e.target) && e.target !== menuToggle && !menuList.classList.contains('hidden')) {
                menuList.classList.add('hidden');
            }
        });
    } else {
        console.error('Menu toggle button or menu list element not found.');
    }

    // Add listener for the main sidebar toggle button
    const sidebarToggle = document.getElementById('toggle-sidebar');
    if (sidebarToggle) {
         sidebarToggle.addEventListener('click', toggleSidebar);
    } else {
        console.error("Sidebar toggle button (#toggle-sidebar) not found.");
    }
});
// --- END OF FILE uiControls.js ---
