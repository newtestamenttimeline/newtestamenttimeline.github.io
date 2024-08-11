function filterEventsByText(text, isChecked) {
    console.log(`Filtering by text: ${text}, isChecked: ${isChecked}`);
    const events = document.querySelectorAll('.event');
    console.log(`Total events found: ${events.length}`);
    events.forEach(event => {
        const eventTexts = JSON.parse(event.getAttribute('data-texts'));
        console.log(`Event texts: ${eventTexts}`);
        const allUnchecked = eventTexts.every(eventText => 
            !document.querySelector(`#text-list input[type="checkbox"][value="${eventText}"]`).checked
        );
        if (allUnchecked) {
            console.log(`Greying out event: ${event}`);
            event.classList.add('greyed-out');
        } else {
            event.classList.remove('greyed-out');
        }
    });
}

function filterEventsByFamily(family, isChecked) {
    const events = document.querySelectorAll('.event');
    events.forEach(event => {
        const eventFamily = event.getAttribute('data-family');
        if (isChecked && eventFamily === family) {
            event.classList.remove('greyed-out');
        } else if (!isChecked && eventFamily === family) {
            event.classList.add('greyed-out');
        }
    });
}

function initializeFilters() {
    const textList = document.getElementById('text-list');
    const familyList = document.getElementById('family-list');

    texts.forEach(text => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<input type="checkbox" checked> ${text}`;
        listItem.querySelector('input').addEventListener('change', (e) => {
            filterEventsByText(text, e.target.checked);
        });
        textList.appendChild(listItem);
    });

    families.forEach(family => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<input type="checkbox" checked> ${family}`;
        listItem.querySelector('input').addEventListener('change', (e) => {
            filterEventsByFamily(family, e.target.checked);
        });
        familyList.appendChild(listItem);
    });
}
