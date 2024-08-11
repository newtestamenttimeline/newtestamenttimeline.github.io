//commenting to redeploy!
function filterEventsByText(text, isChecked) {
    const events = document.querySelectorAll('.event');
    events.forEach(event => {
        const eventTexts = JSON.parse(event.getAttribute('data-texts'));
        if (isChecked) {
            if (eventTexts.includes(text)) {
                event.classList.remove('greyed-out');
            }
        } else {
            if (eventTexts.includes(text)) {
                const remainingTexts = eventTexts.filter(t => texts.has(t));
                if (remainingTexts.length === 0) {
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
        if (isChecked) {
            if (eventFamily === family) {
                event.classList.remove('greyed-out');
            }
        } else {
            if (eventFamily === family) {
                const remainingFamilies = Array.from(families).filter(f => f !== family);
                if (remainingFamilies.length === 0) {
                    event.classList.add('greyed-out');
                }
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
