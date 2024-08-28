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
    const yearLabels = [
        { year: 0, left: '0%' },
        { year: 100, left: '7%' },
        { year: 150, left: '11%' },
        { year: 300, left: '22%' },
        { year: 500, left: '32%' },
        { year: 750, left: '53%' },
        { year: 1000, left: '71%' },
        { year: 1250, left: '90%' },
        { year: 1400, left: '100%' }
    ];

    yearLabels.forEach(label => {
        const yearLabel = document.createElement('div');
        yearLabel.className = 'year-label';
        yearLabel.style.left = label.left;
        yearLabel.innerText = label.year;
        timeline.appendChild(yearLabel);
    });
}
