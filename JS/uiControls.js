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
function generateLegend() {
    if (!legendContainer) {
        console.error("Legend container element (#legend) not found.");
        return;
    }
    // Ensure eventTypes is a populated Set before proceeding
    if (!(typeof eventTypes === 'object' && eventTypes instanceof Set && eventTypes.size > 0)) {
        console.error("Cannot generate legend: eventTypes Set is not defined, not a Set, or is empty.");
        legendContainer.innerHTML = '<h3>Manuscript Types</h3><p>No types found.</p>'; // Provide feedback
        return;
    }

    legendContainer.innerHTML = ''; // Clear previous content

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
    };
    // --- End Definitions ---

    // --- Create Header and Toggle Button ---
    const headerDiv = document.createElement('div');
    headerDiv.style.display = 'flex';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.justifyContent = 'space-between';
    headerDiv.style.marginBottom = '5px'; // Consistent spacing

    const legendHeader = document.createElement('h3');
    legendHeader.textContent = 'Manuscript Types '; // Add space for tooltip icon
    const headerTooltipSpan = document.createElement('span');
    headerTooltipSpan.className = 'question-mark';
    headerTooltipSpan.innerHTML = `? <span class="tooltip">Filter events by their general category (Papyrus, Uncial, Historical, etc.).</span>`;
    // Append tooltip directly to h3
    legendHeader.appendChild(headerTooltipSpan);


    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggle-legend-button'; // More specific ID
    toggleButton.setAttribute('aria-label', 'Toggle Manuscript Types visibility');
    toggleButton.className = 'toggle-legend'; // Use existing styles if available
    toggleButton.style.background = 'none'; // Reset styles
    toggleButton.style.border = 'none';
    toggleButton.style.padding = '0 5px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.innerHTML = '<div class="arrow"></div>'; // Arrow indicates state

    headerDiv.appendChild(legendHeader);
    headerDiv.appendChild(toggleButton);
    legendContainer.appendChild(headerDiv); // Add header section first
    // --- End Header ---


    // --- Create and Populate List ---
    const legendList = document.createElement('ul');
    legendList.id = 'legend-list-items'; // ID for targeting
    legendList.style.paddingLeft = '0';
    legendList.style.listStyle = 'none';
    legendList.style.margin = '0'; // Reset margin
    legendList.style.display = 'block'; // Start expanded

    const sortedEventTypes = Array.from(eventTypes)
        .filter(type => legendOrder.includes(type))
        .sort((a, b) => legendOrder.indexOf(a) - legendOrder.indexOf(b));

    Array.from(eventTypes).forEach(type => {
        if (!legendOrder.includes(type)) {
            sortedEventTypes.push(type);
            if (!legendTooltips[type]) legendTooltips[type] = `Events categorized as ${type}.`;
        }
    });

    sortedEventTypes.forEach(eventType => {
        const legendItem = document.createElement('li');
        legendItem.className = 'legend-item'; // Use existing class

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'legend-checkbox';
        checkbox.checked = true;
        checkbox.id = `legend-checkbox-${eventType}`;
        checkbox.dataset.eventType = eventType;
        checkbox.addEventListener('change', applyAllFilters); // Central filter listener

        const legendColor = document.createElement('div');
        legendColor.className = 'legend-color';
        legendColor.style.backgroundColor = typeof getColorForEventType === 'function' ? getColorForEventType(eventType) : '#ccc';

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        const labelText = eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        label.textContent = ` ${labelText}`;

        const questionMark = document.createElement('span');
        questionMark.className = 'question-mark';
        questionMark.textContent = '?';
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip';
        tooltip.textContent = legendTooltips[eventType] || `Information about ${labelText}.`;
        questionMark.appendChild(tooltip);

        legendItem.appendChild(checkbox);
        legendItem.appendChild(legendColor);
        legendItem.appendChild(label);
        legendItem.appendChild(questionMark);
        legendList.appendChild(legendItem); // Append item to the UL
    });

    legendContainer.appendChild(legendList); // Add the populated list
    // --- End List ---


    // --- Add Toggle Functionality ---
    toggleButton.addEventListener('click', () => {
        const list = document.getElementById('legend-list-items'); // Target the list directly
        if (list) {
            const isCollapsed = list.style.display === 'none';
            list.style.display = isCollapsed ? 'block' : 'none';
            toggleButton.querySelector('.arrow').classList.toggle('collapsed', !isCollapsed);
        } else {
            console.error("Could not find legend list to toggle.");
        }
    });
    // --- End Toggle ---

    console.log("Legend generated successfully.");
}


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
