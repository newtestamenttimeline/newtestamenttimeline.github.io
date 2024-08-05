// JavaScript to load events from JSON files and update the UI

// Function to fetch and process JSON data
async function fetchAndProcessJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch data from ${url}: ${response.statusText}`);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}: ${error}`);
        return [];
    }
}

// Function to update filters
function updateFilters(data, textList, familyList) {
    data.forEach(event => {
        // Check and add new texts to the text list
        if (event.text && !textList.includes(event.text)) {
            textList.push(event.text);
            const li = document.createElement('li');
            li.textContent = event.text;
            document.getElementById('text-list').appendChild(li);
        }

        // Check and add new families to the family list
        if (event.family && !familyList.includes(event.family)) {
            familyList.push(event.family);
            const li = document.createElement('li');
            li.textContent = event.family;
            document.getElementById('family-list').appendChild(li);
        }
    });
}

// Main function to load more manuscripts
async function loadMoreManuscripts() {
    console.log('Loading more manuscripts...');
    const minusculesData = await fetchAndProcessJSON('minuscules.json');
    const lectionariesData = await fetchAndProcessJSON('lectionaries.json');

    if (minusculesData.length === 0 && lectionariesData.length === 0) {
        console.error('No data loaded from JSON files.');
        return;
    }

    console.log('Data loaded successfully:', {
        minuscules: minusculesData.length,
        lectionaries: lectionariesData.length
    });

    const textList = Array.from(document.getElementById('text-list').children).map(item => item.textContent);
    const familyList = Array.from(document.getElementById('family-list').children).map(item => item.textContent);

    updateFilters(minusculesData, textList, familyList);
    updateFilters(lectionariesData, textList, familyList);
    console.log('Filters updated.');
}

// Event listener for the Load More Manuscripts button
document.getElementById('load-more-manuscripts').addEventListener('click', loadMoreManuscripts);
