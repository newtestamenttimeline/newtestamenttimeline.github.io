// Load content and parallel data from JSON files
fetch('content.json')
  .then(response => response.json())
  .then(data => {
    populateGospels(data);
    highlightUniqueVerses(data.parallelVerses);
    addVerseClickListeners(data.parallelVerses);
  });

function populateGospels(data) {
  ['matthew', 'mark', 'luke', 'john'].forEach(gospel => {
    const container = document.getElementById(`${gospel}-content`);
    data[gospel].forEach(chapter => {
      const chapterHeader = document.createElement('h3');
      chapterHeader.textContent = `Chapter ${chapter.chapter}`;
      container.appendChild(chapterHeader);
      chapter.verses.forEach(verse => {
        const verseElement = document.createElement('p');
        verseElement.textContent = `${verse.number} ${verse.text}`;
        verseElement.setAttribute('data-verse', `${gospel}-${chapter.chapter}-${verse.number}`);
        container.appendChild(verseElement);
      });
    });
  });
}

function highlightUniqueVerses(parallelVerses) {
  document.querySelectorAll('.column p').forEach(verse => {
    const verseId = verse.getAttribute('data-verse');
    if (!parallelVerses[verseId] || parallelVerses[verseId].length === 0) {
      verse.classList.add('unique');
    }
  });
}

function addVerseClickListeners(parallelVerses) {
  document.querySelectorAll('.column p').forEach(verse => {
    verse.addEventListener('click', (event) => highlightParallelVerses(event, parallelVerses));
  });
}

function highlightParallelVerses(event, parallelVerses) {
  const verseId = event.target.getAttribute('data-verse');

  // Remove previous highlights
  document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
  
  event.target.classList.add('highlight');
  
  if (parallelVerses[verseId]) {
    parallelVerses[verseId].forEach(parallelVerseId => {
      const parallelVerse = document.querySelector(`p[data-verse="${parallelVerseId}"]`);
      if (parallelVerse) {
        parallelVerse.classList.add('highlight');
        scrollToVerse(parallelVerse);
      }
    });
  }

  // Also scroll the clicked verse into view
  scrollToVerse(event.target);
}

function scrollToVerse(verseElement) {
  const columnElement = verseElement.closest('.column');
  const columnRect = columnElement.getBoundingClientRect();
  const verseRect = verseElement.getBoundingClientRect();
  
  // Calculate the scroll position to center the verse
  const scrollTop = verseRect.top + columnElement.scrollTop - columnRect.top - (columnRect.height / 2) + (verseRect.height / 2);
  
  columnElement.scrollTo({
    top: scrollTop,
    behavior: 'smooth'
  });
}
