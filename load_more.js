// Function to load additional events from JSON files
async function loadAdditionalEvents() {
    try {
        // Fetch events from JSON files
        const lectionariesEvents = await fetch('lectionaries.json').then(response => response.json());
        const minusculesEvents = await fetch('minuscules.json').then(response => response.json());

        // Process the additional events and add them to the timeline
        processEvents(lectionariesEvents, minusculesEvents);

        // Update the filters and lists with new events
        populateTextList();
        populateFamilyList();
        generateLegend();
    } catch (error) {
        console.error('Error loading additional events:', error);
    }
}

// Add event listener to the "Load More" button
document.getElementById('load-more-events').addEventListener('click', () => {
    loadAdditionalEvents();
});
