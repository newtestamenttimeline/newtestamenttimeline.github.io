function filterEventsByText(text, isChecked) {
    const events = document.querySelectorAll('.event');
    events.forEach(event => {
        const eventTextsAttr = event.getAttribute('data-texts');
        
        if (eventTextsAttr) {
            let eventTexts = [];
            try {
                eventTexts = JSON.parse(eventTextsAttr);
            } catch (error) {
                console.error('Error parsing data-texts:', error);
            }

            if (Array.isArray(eventTexts) && eventTexts.length > 0) {
                if (isChecked && eventTexts.includes(text)) {
                    event.classList.remove('greyed-out');
                } else if (!isChecked && eventTexts.includes(text)) {
                    event.classList.add('greyed-out');
                }
            }
        }
    });
}


function filterEventsByFamily(family, isChecked) {
    const events = document.querySelectorAll('.event');
    events.forEach(event => {
        const eventFamily = event.getAttribute('data-family');

        if (eventFamily) {
            if (isChecked && eventFamily === family) {
                event.classList.remove('greyed-out');
            } else if (!isChecked && eventFamily === family) {
                event.classList.add('greyed-out');
            }
        }
    });
}


function initializeFilters() {
    const textList = document.getElementById('text-list');
    const familyList = document.getElementById('family-list');

    // Clear existing filters
    textList.innerHTML = '';
    familyList.innerHTML = '';

    // Populate text filters
    texts.forEach(text => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<input type="checkbox" checked value="${text}"> ${text}`;
        const checkbox = listItem.querySelector('input');
        checkbox.addEventListener('change', (e) => {
            console.log('Text filter checkbox changed:', e.target.value, e.target.checked);
            filterEventsByText(e.target.value, e.target.checked);
        });
        textList.appendChild(listItem);
    });

    // Populate family filters
    families.forEach(family => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<input type="checkbox" checked value="${family}"> ${family}`;
        const checkbox = listItem.querySelector('input');
        checkbox.addEventListener('change', (e) => {
            console.log('Family filter checkbox changed:', e.target.value, e.target.checked);
            filterEventsByFamily(e.target.value, e.target.checked);
        });
        familyList.appendChild(listItem);
    });

    // Log the initialization
    console.log('Filters initialized for texts and families');
}


