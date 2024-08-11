async function loadGospels() {
    try {
        const matthew = await fetch('matthew.json').then(res => res.json()).catch(err => console.error('Error loading matthew.json:', err));
        const mark = await fetch('mark.json').then(res => res.json()).catch(err => console.error('Error loading mark.json:', err));
        const luke = await fetch('luke.json').then(res => res.json()).catch(err => console.error('Error loading luke.json:', err));
        const john = await fetch('john.json').then(res => res.json()).catch(err => console.error('Error loading john.json:', err));
        const parallels = await fetch('parallels.json').then(res => res.json()).catch(err => console.error('Error loading parallels.json:', err));

        // Log the loaded data to inspect
        console.log('Matthew:', matthew);
        console.log('Mark:', mark);
        console.log('Luke:', luke);
        console.log('John:', john);
        console.log('Parallels:', parallels);

        // Check if any gospel data is undefined
        if (!matthew || !mark || !luke || !john || !parallels) {
            console.error('One or more gospels failed to load.');
            return;
        }

        // Populate each gospel with the corresponding data
        populateGospel('matthew', matthew, parallels);
        populateGospel('mark', mark, parallels);
        populateGospel('luke', luke, parallels);
        populateGospel('john', john, parallels);

        addVerseClickListeners(parallels);
    } catch (error) {
        console.error('Error loading gospels:', error);
        alert('Failed to load the requested file. Please check the console for more details.');
    }
}

function populateGospel(gospelName, gospelContent, parallels) {
    if (!Array.isArray(gospelContent)) {
        console.error(`${gospelName}.json data is not an array or is undefined.`);
        return;
    }

    const container = document.getElementById(`${gospelName}-content`);

    // Clear existing content
    container.innerHTML = '';

    gospelContent.forEach(entry => {
        const chapterElement = document.createElement('div');
        chapterElement.classList.add('summary-chapter');

        // Add group title if it exists
        if (entry.group_title) {
            const groupTitleElement = document.createElement('h3');
            groupTitleElement.textContent = entry.group_title;
            groupTitleElement.classList.add('group-title');
            chapterElement.appendChild(groupTitleElement);
        }

        // Add chapter summary
        const summaryElement = document.createElement('p');
        summaryElement.textContent = `${entry.chapter}: ${entry.summary}`;
        summaryElement.classList.add('chapter-summary');
        chapterElement.appendChild(summaryElement);

        container.appendChild(chapterElement);
    });
}

function addVerseClickListeners(parallels) {
    // Assuming this function handles highlighting parallels, it may need to be adapted or removed
    // if parallels don't apply directly to the summary data.
}

function scrollToVerse(verseElement) {
    const columnElement = verseElement.closest('.column');
    const columnRect = columnElement.getBoundingClientRect();
    const verseRect = verseElement.getBoundingClientRect();

    const scrollTop = verseRect.top + columnElement.scrollTop - columnRect.top - (columnRect.height / 2) + (verseRect.height / 2);

    columnElement.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
    });
}

// Event listener for the translation selector
document.getElementById('translation-selector').addEventListener('change', loadGospels);

loadGospels();
