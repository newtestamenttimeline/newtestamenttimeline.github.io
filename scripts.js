// script.js

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
      const verseId = `${gospelId}-${chapter.chapter}-${verse.number}`;
      verseElement.setAttribute('data-verse', verseId);
      container.appendChild(verseElement);
    });
  });
}

function addVerseClickListeners(parallels) {
  document.querySelectorAll('.column p').forEach(verse => {
    verse.addEventListener('click', event => highlightParallelVerses(event, parallels));
  });
}

function highlightParallelVerses(event, parallels) {
  const verseId = event.target.getAttribute('data-verse');

  // Remove previous highlights
  document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));

  // Find the group containing the clicked verse
  let foundGroup = null;
  for (const [group, verses] of Object.entries(parallels)) {
    if (verses.includes(verseId)) {
      foundGroup = verses;
      break;
    }
  }

  if (foundGroup) {
    // Highlight and scroll to all verses in the found group
    foundGroup.forEach(parallelVerseId => {
      const parallelVerse = document.querySelector(`p[data-verse="${parallelVerseId}"]`);
      if (parallelVerse) {
        parallelVerse.classList.add('highlight');
        scrollToVerse(parallelVerse);
      }
    });
  }

  // Also highlight and scroll to the clicked verse
  event.target.classList.add('highlight');
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
