async function loadGospels() {
  // Load the gospels and parallel groups
  const gospels = await Promise.all([
    fetch('matthew.json').then(res => res.json()),
    fetch('mark.json').then(res => res.json()),
    fetch('luke.json').then(res => res.json()),
    fetch('john.json').then(res => res.json()),
    fetch('parallels.json').then(res => res.json()) // Load the group-based parallels
  ]);

  const [matthew, mark, luke, john, parallelGroups] = gospels;

  // Populate the content for each gospel
  populateGospel('matthew', matthew);
  populateGospel('mark', mark);
  populateGospel('luke', luke);
  populateGospel('john', john);

  // Add click listeners to each verse with the group-based parallels
  addVerseClickListeners(parallelGroups);
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

function addVerseClickListeners(parallelGroups) {
  document.querySelectorAll('.column p').forEach(verse => {
    verse.addEventListener('click', (event) => highlightParallelVerses(event, parallelGroups));
  });
}

function highlightParallelVerses(event, parallelGroups) {
  const verseId = event.target.getAttribute('data-verse');

  // Remove previous highlights
  document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));

  // Highlight the clicked verse
  event.target.classList.add('highlight');

  // Find the group that contains the clicked verse
  let group = null;
  for (let groupId in parallelGroups) {
    if (parallelGroups[groupId].includes(verseId)) {
      group = parallelGroups[groupId];
      break;
    }
  }

  // Highlight and scroll to the parallel verses
  if (group) {
    group.forEach(parallelVerseId => {
      const parallelVerse = document.querySelector(`p[data-verse="${parallelVerseId}"]`);
      if (parallelVerse) {
        parallelVerse.classList.add('highlight');
        scrollToVerse(parallelVerse);
      }
    });
  }

  // Scroll to the clicked verse
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

// Load the gospels and parallel data when the page is ready
loadGospels();
