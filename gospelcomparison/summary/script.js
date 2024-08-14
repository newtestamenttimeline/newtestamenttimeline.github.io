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

        // Handle chapter summaries
        if (entry.summary) {
            const summaryElement = document.createElement('div');
            summaryElement.classList.add('chapter-summary');

            if (entry.sections) {
                // Handle sections within a chapter or group of chapters
                const sectionContainer = document.createElement('div');
                sectionContainer.classList.add('section-container');

                entry.sections.forEach(section => {
                    const sectionElement = document.createElement('div');
                    sectionElement.classList.add('verse-box');
                    sectionElement.textContent = `${section.chapter_verse}: ${section.verse_title}`;
                    
                    const summaryId = `${gospelName}-${section.chapter_verse}`;
                    sectionElement.setAttribute('data-summary', summaryId);

                    // Check for parallels and add initial coloring
                    let found = false;
                    for (const group in parallels) {
                        if (parallels[group].includes(summaryId)) {
                            found = true;
                            const parallelCount = parallels[group].length;
                            if (parallelCount === 2) {
                                sectionElement.classList.add('pastel-green');
                            } else if (parallelCount === 3) {
                                sectionElement.classList.add('pastel-purple');
                            } else if (parallelCount >= 4) {
                                sectionElement.classList.add('pastel-pink');
                            }
                            break;
                        }
                    }

                    if (!found) {
                        sectionElement.classList.add('unique');
                    }

                    sectionContainer.appendChild(sectionElement);
                });

                summaryElement.appendChild(sectionContainer);
            } else {
                // Handle whole chapter or single part (e.g., 4a, 4b)
                summaryElement.textContent = `${entry.chapter}: ${entry.summary}`;
            }

            chapterElement.appendChild(summaryElement);
        }

        container.appendChild(chapterElement);
    });

    // Add click listeners for scrolling to parallels and changing color
    container.querySelectorAll('.verse-box').forEach(verse => {
        verse.addEventListener('click', (event) => highlightParallelSummaries(event, parallels));
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
    // First, remove any existing SVG lines
    const existingSvg = document.querySelector('.svg-container');
    if (existingSvg) {
        existingSvg.remove();
    }

    // Create a new SVG container
    const svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgContainer.setAttribute("class", "svg-container");
    svgContainer.style.position = 'absolute';
    svgContainer.style.width = '100%';
    svgContainer.style.height = '100%';
    svgContainer.style.top = '0';
    svgContainer.style.left = '0';
    svgContainer.style.pointerEvents = 'none'; // Allows clicks to pass through the lines

    document.body.appendChild(svgContainer);

    for (const group in parallels) {
        const elements = parallels[group].map(id => document.querySelector(`div[data-summary="${id}"]`)).filter(Boolean);

        if (elements.length < 2) continue;

        elements.forEach((element, index) => {
            if (index === 0) return;
            const previousElement = elements[index - 1];

            const startX = previousElement.getBoundingClientRect().right + window.scrollX;
            const startY = previousElement.getBoundingClientRect().top + window.scrollY + previousElement.clientHeight / 2;
            const endX = element.getBoundingClientRect().left + window.scrollX;
            const endY = element.getBoundingClientRect().top + window.scrollY + element.clientHeight / 2;

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", startX);
            line.setAttribute("y1", startY);
            line.setAttribute("x2", endX);
            line.setAttribute("y2", endY);
            line.setAttribute("stroke-width", "2");
            line.setAttribute("stroke", getColorByClass(previousElement)); // Color based on the class

            svgContainer.appendChild(line);
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
    loadGospels();
});
