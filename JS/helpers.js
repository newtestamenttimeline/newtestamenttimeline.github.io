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
    const yearLabels = [1, 100, 300, 500, 750, 1000, 1250, 1500, 1750, 2000]; // Define year markers

    yearLabels.forEach(year => {
        const yearLabel = document.createElement('div');
        yearLabel.className = 'year-label';
        yearLabel.innerText = year;

        // Dynamically calculate the position so the center of the label aligns with the event dots
        let newLeft = ((year - 1) / 1999) * 100;
        yearLabel.style.left = `calc(${newLeft}% - 15px)`; // Adjust by half the label width

        timeline.appendChild(yearLabel);
    });
}

