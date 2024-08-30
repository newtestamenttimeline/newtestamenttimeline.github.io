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
