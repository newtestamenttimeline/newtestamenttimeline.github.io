document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('timelineCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get canvas context');
        return;
    }

    const content = document.getElementById('event-content');
    const sidebar = document.getElementById('sidebar');
    const legendContainer = document.getElementById('legend');
    let scale = 1;
    let selectedEvent = null;
    const texts = new Set();
    const families = new Set();
    const eventTypes = new Set();
    const eventTypeColors = {};
    let allEvents = [];
    const dotRadius = 6;
    const dotDiameter = dotRadius * 2;
    const spacing = 20; // Minimum space between dots
    const animationDuration = 1000; // Duration of the animation in ms
    const startYear = 0;
    const endYear = 1400;
    const interval = 100; // Interval for year labels
    const maxLayers = 5; // Maximum number of layers to try placing dots
    const eventPositions = []; // Store event positions for click detection

    // Add event listeners for sidebar and legend toggles
    document.getElementById('toggle-legend')?.addEventListener('click', () => {
        const legend = document.getElementById('legend');
        legend.classList.toggle('collapsed');
        const arrow = document.querySelector('#toggle-legend .arrow');
        arrow.classList.toggle('collapsed');
    });

    document.getElementById('toggle-sidebar')?.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const arrow = document.querySelector('#toggle-sidebar .arrow-reverse');
        arrow.classList.toggle('collapsed');
    });

    // Load and process events
    async function loadEvents() {
        try {
            const historicalEvents = await fetch('historical_events.json').then(response => response.json());
            const manuscriptEvents = await fetch('manuscripts.json').then(response => response.json());
            const uncialEvents = await fetch('uncials.json').then(response => response.json());

            allEvents = [...historicalEvents, ...manuscriptEvents, ...uncialEvents];
            console.log('Loaded Events:', allEvents); // Debugging: log loaded events

            allEvents.forEach(event => {
                processEvent(event);
                eventTypes.add(event.eventType);
                if (event.texts) {
                    event.texts.forEach(text => texts.add(text));
                }
                if (event.family) {
                    families.add(event.family);
                }
            });

            generateColorsForEventTypes();
            drawTimeline(allEvents);
            initializeFilters();
            populateTextList();
            populateFamilyList();
            generateLegend();
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

    function drawTimeline(events) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw timeline line
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // Draw year labels
        for (let year = startYear; year <= endYear; year += interval) {
            const x = (year / endYear) * canvas.width;
            ctx.fillStyle = '#000';
            ctx.font = '14px Arial';
            ctx.fillText(year, x, canvas.height / 2 - 10);
            ctx.beginPath();
            ctx.moveTo(x, canvas.height / 2 - 5);
            ctx.lineTo(x, canvas.height / 2 + 5);
            ctx.stroke();
            ctx.closePath();
        }

        // Draw events
        eventPositions.length = 0; // Clear previous positions
        events.forEach(event => {
            ctx.beginPath();
            ctx.arc(event.x, event.y, dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = getColorForEventType(event.eventType);
            ctx.fill();
            ctx.closePath();
            eventPositions.push({ x: event.x, y: event.y, event: event });
        });
    }

    function animateDots(events, startTime) {
        const currentTime = performance.now();
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / animationDuration, 1);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw the timeline line and year labels
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        for (let year = startYear; year <= endYear; year += interval) {
            const x = (year / endYear) * canvas.width;
            ctx.fillStyle = '#000';
            ctx.font = '14px Arial';
            ctx.fillText(year, x, canvas.height / 2 - 10);
            ctx.beginPath();
            ctx.moveTo(x, canvas.height / 2 - 5);
            ctx.lineTo(x, canvas.height / 2 + 5);
            ctx.stroke();
            ctx.closePath();
        }

        events.forEach(event => {
            const startX = (event.year / endYear) * canvas.width;
            const startY = canvas.height / 2;
            const targetX = event.x;
            const targetY = event.y;

            const currentX = startX + (targetX - startX) * progress;
            const currentY = startY + (targetY - startY) * progress;

            ctx.beginPath();
            ctx.arc(currentX, currentY, dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = getColorForEventType(event.eventType);
            ctx.fill();
            ctx.closePath();
        });

        if (progress < 1) {
            requestAnimationFrame(() => animateDots(events, startTime));
        } else {
            drawTimeline(events); // Ensure the final state is drawn
        }
    }

    function processEvent(event) {
        // Calculate x-coordinate based on the year of the event
        event.x = (event.year / endYear) * canvas.width;
        // Ensure y-coordinate is provided in the event data
        if (!event.y) {
            event.y = canvas.height / 2; // Default to center if not specified
        }
        console.log('Processed Event:', event); // Debugging: log processed event
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

    function initializeFilters() {
        populateTextList();
        populateFamilyList();
    }

    function populateTextList() {
        const textList = document.getElementById('text-list');
        if (!textList) return;
        textList.innerHTML = '';
        texts.forEach(text => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<input type="checkbox" checked> ${text}`;
            listItem.querySelector('input').addEventListener('change', () => {
                filterEvents();
            });
            textList.appendChild(listItem);
        });
    }

    function populateFamilyList() {
        const familyList = document.getElementById('family-list');
        if (!familyList) return;
        familyList.innerHTML = '';
        families.forEach(family => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<input type="checkbox" checked> ${family}`;
            listItem.querySelector('input').addEventListener('change', () => {
                filterEvents();
            });
            familyList.appendChild(listItem);
        });
    }

    function filterEvents() {
        const activeTexts = new Set(
            [...document.querySelectorAll('#text-list input:checked')].map(input => input.parentElement.textContent.trim())
        );
        const activeFamilies = new Set(
            [...document.querySelectorAll('#family-list input:checked')].map(input => input.parentElement.textContent.trim())
        );

        const filteredEvents = allEvents.filter(event => {
            const matchesText = event.texts ? event.texts.some(text => activeTexts.has(text)) : true;
            const matchesFamily = event.family ? activeFamilies.has(event.family) : true;
            return matchesText && matchesFamily;
        });

        drawTimeline(filteredEvents);
    }

    function generateLegend() {
        legendContainer.innerHTML = '';

        eventTypes.forEach(eventType => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';

            const legendColor = document.createElement('div');
            legendColor.className = 'legend-color';
            legendColor.style.backgroundColor = getColorForEventType(eventType);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'legend-checkbox';
            checkbox.checked = true;
            checkbox.addEventListener('change', (e) => {
                toggleEventsByType(eventType, e.target.checked);
            });

            const label = document.createElement('span');
            label.textContent = eventType.charAt(0).toUpperCase() + eventType.slice(1) + ' Events';

            const questionMark = document.createElement('span');
            questionMark.className = 'question-mark';
            questionMark.textContent = '?';
            const tooltip = document.createElement('span');
            tooltip.className = 'tooltip';
            tooltip.textContent = `Filter events by ${eventType} type`;
            questionMark.appendChild(tooltip);
            legendItem.appendChild(checkbox);
            legendItem.appendChild(legendColor);
            legendItem.appendChild(label);
            legendItem.appendChild(questionMark);

            legendContainer.appendChild(legendItem);
        });
    }

    function toggleEventsByType(eventType, isChecked) {
        const events = allEvents.filter(event => event.eventType === eventType);
        if (isChecked) {
            events.forEach(event => {
                event.visible = true;
            });
        } else {
            events.forEach(event => {
                event.visible = false;
            });
        }
        const visibleEvents = allEvents.filter(event => event.visible);
        drawTimeline(visibleEvents);
    }

    // Add zoom functionality
    document.getElementById('zoom-in')?.addEventListener('click', () => {
        scale *= 1.2;
        canvas.style.transform = `scale(${scale})`;
        canvas.style.transformOrigin = '0 0';
    });

    document.getElementById('zoom-out')?.addEventListener('click', () => {
        scale /= 1.2;
        canvas.style.transform = `scale(${scale})`;
        canvas.style.transformOrigin = '0 0';
    });

    canvas.addEventListener('dblclick', (e) => {
        const rect = canvas.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const targetPercentage = offsetX / rect.width;
        const targetScroll = targetPercentage * canvas.scrollWidth * scale - rect.width / 2;

        canvas.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });

        scale *= 1.2;
        canvas.style.transform = `scale(${scale})`;
        canvas.style.transformOrigin = '0 0';
    });

    let isDown = false;
    let startX;
    let scrollLeft;

    canvas.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - canvas.offsetLeft;
        scrollLeft = canvas.scrollLeft;
    });

    canvas.addEventListener('mouseleave', () => {
        isDown = false;
    });

    canvas.addEventListener('mouseup', () => {
        isDown = false;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - canvas.offsetLeft;
        const walk = (x - startX) * 3;
        canvas.scrollLeft = scrollLeft - walk;
    });

    new ResizeObserver(() => {
        canvas.scrollLeft = (canvas.scrollWidth - canvas.clientWidth) / 2;
    }).observe(canvas);

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const offsetX = (e.clientX - rect.left) / scale;
        const offsetY = (e.clientY - rect.top) / scale;

        for (const pos of eventPositions) {
            const dx = offsetX - pos.x;
            const dy = offsetY - pos.y;
            if (Math.sqrt(dx * dx + dy * dy) < dotRadius) {
                showEventDetails(pos.event);
                break;
            }
        }
    });

    function showEventDetails(event) {
        content.innerHTML = `
            <h2>${event.title}</h2>
            <p>${event.description}</p>
        `;
    }

    loadEvents();

    // Register service worker for client-side caching
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    }
});
