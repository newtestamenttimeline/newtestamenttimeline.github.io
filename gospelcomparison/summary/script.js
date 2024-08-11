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

        // Draw lines connecting the parallel summaries after loading all gospels
        drawLinesBetweenParallels(parallels);

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

        const summaryId = `${gospelName}-${entry.chapter}`;
        chapterElement.setAttribute('data-summary', summaryId);

        // Check for parallels and add initial coloring
        let found = false;
        for (const group in parallels) {
            if (parallels[group].includes(summaryId)) {
                found = true;
                const parallelCount = parallels[group].length;
                if (parallelCount === 2) {
                    summaryElement.classList.add('pastel-green');
                } else if (parallelCount === 3) {
                    summaryElement.classList.add('pastel-purple');
                } else if (parallelCount >= 4) {
                    summaryElement.classList.add('pastel-pink');
                }
                break;
            }
        }

        if (!found) {
            summaryElement.classList.add('unique');
        }

        chapterElement.appendChild(summaryElement);
        container.appendChild(chapterElement);
    });

    // Add click listeners for scrolling to parallels and changing color
    container.querySelectorAll('.summary-chapter').forEach(summary => {
        summary.addEventListener('click', (event) => highlightParallelSummaries(event, parallels));
    });
}

function highlightParallelSummaries(event, parallels) {
    const summaryId = event.currentTarget.getAttribute('data-summary');
    console.log(`Clicked summary ID: ${summaryId}`);

    let foundGroup = null;

    for (const group in parallels) {
        if (parallels[group].includes(summaryId)) {
            foundGroup = parallels[group];
            break;
        }
    }

    if (foundGroup) {
        console.log(`Parallel summaries for ${summaryId}: ${foundGroup}`);
    } else {
        console.warn(`No parallels found for summary ID: ${summaryId}`);
        return;
    }

    // Remove previous highlights and revert to original colors
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    document.querySelectorAll('.summary-chapter').forEach(summary => {
        const paragraph = summary.querySelector('p.chapter-summary');
        if (paragraph) {
            // Revert to original color
            summary.querySelector('p.chapter-summary').classList.remove('royal-blue');
        }
    });

    // Highlight current and parallel summaries in royal blue
    event.currentTarget.querySelector('p.chapter-summary').classList.add('royal-blue');
    foundGroup.forEach(parallelSummaryId => {
        const parallelSummary = document.querySelector(`div[data-summary="${parallelSummaryId}"]`);
        if (parallelSummary) {
            console.log(`Highlighting parallel summary ID: ${parallelSummaryId}`);
            parallelSummary.querySelector('p.chapter-summary').classList.add('royal-blue');
            scrollToSummary(parallelSummary);
        } else {
            console.warn(`Parallel summary ID not found in DOM: ${parallelSummaryId}`);
        }
    });

    scrollToSummary(event.currentTarget);
}

function scrollToSummary(summaryElement) {
    const columnElement = summaryElement.closest('.column');
    const columnRect = columnElement.getBoundingClientRect();
    const summaryRect = summaryElement.getBoundingClientRect();

    const scrollTop = summaryRect.top + columnElement.scrollTop - columnRect.top - (columnRect.height / 2) + (summaryRect.height / 2);

    columnElement.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
    });
}

function drawLinesBetweenParallels(parallels) {
    const container = document.getElementById('lines-container');
    container.innerHTML = ''; // Clear previous lines

    for (const group in parallels) {
        const elements = parallels[group].map(id => document.querySelector(`div[data-summary="${id}"]`)).filter(Boolean);

        if (elements.length < 2) continue;

        elements.forEach((element, index) => {
            if (index === 0) return;
            const previousElement = elements[index - 1];

            const start = previousElement.getBoundingClientRect();
            const end = element.getBoundingClientRect();

            const line = document.createElement('div');
            line.classList.add('line');
            line.style.position = 'absolute';
            line.style.width = `${end.left - start.right}px`;
            line.style.height = '2px';
            line.style.top = `${start.top + start.height / 2}px`;
            line.style.left = `${start.right}px`;
            line.style.backgroundColor = getColorByClass(previousElement);

            container.appendChild(line);
        });
    }
}

function getColorByClass(element) {
    if (element.querySelector('.pastel-green')) return 'green';
    if (element.querySelector('.pastel-purple')) return 'purple';
    if (element.querySelector('.pastel-pink')) return 'red';
    return 'black';
}

document.addEventListener('DOMContentLoaded', () => {
    // Add an empty container for the lines
    const container = document.createElement('div');
    container.id = 'lines-container';
    container.style.position = 'absolute';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);

    loadGospels();
});
