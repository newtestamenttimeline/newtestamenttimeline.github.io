// deprectated - Helper function to handle event filtering by attribute
//function filterEventsByAttribute(attribute, value, isChecked) {
  //  const events = document.querySelectorAll('.event');
    //events.forEach(event => {
      //  const eventAttr = event.getAttribute(attribute);

        //if (eventAttr) {
          //  if (isChecked && eventAttr.includes(value)) {
            //    event.classList.remove('greyed-out');
           // } else if (!isChecked && eventAttr.includes(value)) {
             //   event.classList.add('greyed-out');
           // }
      //  }
   // });
//}

// Filter events by text
function filterEventsByText(text, isChecked) {
    const events = document.querySelectorAll(`.event[data-texts*="${text}"]`);
    events.forEach(event => {
        event.style.display = isChecked ? 'block' : 'none';
    });
}


// Filter events by family
function filterEventsByFamily(family, isChecked) {
    const events = document.querySelectorAll(`.event[data-family*="${family}"]`);
    events.forEach(event => {
        event.style.display = isChecked ? 'block' : 'none';
    });
}


// Filter events by event type
function filterEventsByEventType(eventType, isChecked) {
    filterEventsByAttribute('data-event-type', eventType, isChecked);
}

// Central function to create and append filters to the filter list
function createFilterList(filterContainer, filterSet, filterCallback) {
    filterContainer.innerHTML = ''; // Clear existing filters

    filterSet.forEach(filterValue => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<input type="checkbox" checked value="${filterValue}"> ${filterValue}`;
        const checkbox = listItem.querySelector('input');
        checkbox.addEventListener('change', (e) => {
            filterCallback(e.target.value, e.target.checked);
        });
        filterContainer.appendChild(listItem);
    });
}

// Initialize all filters (texts, families, event types)
function initializeFilters() {
    const textList = document.getElementById('text-list');
    const familyList = document.getElementById('family-list');
    const eventTypeList = document.getElementById('event-type-list');

    // Populate text filters
    createFilterList(textList, texts, filterEventsByText);

    // Populate family filters
    createFilterList(familyList, families, filterEventsByFamily);

    // Populate event type filters
    if (eventTypeList) {
        createFilterList(eventTypeList, eventTypes, filterEventsByEventType);
    }

    console.log('Filters initialized for texts, families, and event types');
}
