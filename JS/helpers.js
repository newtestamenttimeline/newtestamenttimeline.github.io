function setUpProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = '0%';
    } else {
        console.error('Progress bar element not found.');
    }
}

function updateProgressBar(progress) {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = progress + '%';
    } else {
        console.error('Progress bar element not found.');
    }
}

function generateColorsForEventTypes() {
    eventTypes.forEach(eventType => {
        if (!eventTypeColors[eventType]) {
            eventTypeColors[eventType] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        }
    });
}


function getColorForEventType(eventType) {
    return eventTypeColors[eventType];
}


function addYearLabels() {
    console.log("addYearLabels() is running..."); // Debugging output

    const yearLabels = [1, 100, 300, 500, 750, 1000, 1250, 1500, 1750, 2000]; // Define year markers

    yearLabels.forEach(year => {
        const yearLabel = document.createElement('div');
        yearLabel.className = 'year-label';
        yearLabel.innerText = year;

        // Dynamically position year labels
        let newLeft = ((year - 1) / 1999) * 100;
        yearLabel.style.left = `calc(${newLeft}% - 15px)`; // Adjust by half the label width

        console.log(`Adding year label: ${year} at ${newLeft}%`); // Debugging output

        // Append to timeline
        document.getElementById("timeline").appendChild(yearLabel);
    });
}
