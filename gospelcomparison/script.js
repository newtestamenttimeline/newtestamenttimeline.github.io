async function loadGospels() {
  const gospels = await Promise.all([
    fetch('matthew.json').then(res => res.json()),
    fetch('mark.json').then(res => res.json()),
    fetch('luke.json').then(res => res.json()),
    fetch('john.json').then(res => res.json()),
    fetch('parallels.json').then(res => res.json())
  ]);

  const [matthew, mark, luke, john, parallels] = gospels;

  populateGospel('matthew', matthew);
  populateGospel('mark', mark);
  populateGospel('luke', luke);
  populateGospel('john', john);

  addVerseClickListeners(parallels);
}

function populateGospel(gospelId, gospelData) {
  const container = document.getElementById(`${gospelId}-content`);
  gospelData.forEach(chapter => {
    const chapterHeader = document.createElement('h3');
    chapterHeader.textContent = `Chapter ${chapter.chapter}`;
    container.appendChild(chapterHeader);
    chapter.verses.forEach(verse => {
      const verseElement = document.createElement('p');
      verseElement.textContent = `${verse.number} ${verse.text}`;
      verseElement.setAttribute('data-verse', `${gospelId}-${chapter.chapter}-${verse.number}`);
      container.appendChild(verseElement);
    });
  });
}

function addVerseClickListeners(parallels) {
  document.querySelectorAll('.column p').forEach(verse => {
    verse.addEventListener('click', (event) => highlightParallelVerses(event, parallels));
  });
}

function highlightParallelVerses(event, parallels) {
  const verseId = event.target.getAttribute('data-verse');

  // Remove previous highlights
  document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
  
  event.target.classList.add('highlight');
  
  if (parallels[verseId]) {
    parallels[verseId].forEach(parallelVerseId => {
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

loadGospels();
