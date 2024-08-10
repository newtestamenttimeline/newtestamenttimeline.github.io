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

  // Debug: Log the loaded parallels data
  console.log('Loaded parallels:', parallels);

  populateGospel('matthew', matthew, parallels);
  populateGospel('mark', mark, parallels);
  populateGospel('luke', luke, parallels);
  populateGospel('john', john, parallels);

  addVerseClickListeners(parallels);
}

function populateGospel(gospelId, gospelData, parallels) {
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

      // Check if this verse is in any group in parallels
      let found = false;
      for (const group in parallels) {
        if (parallels[group].includes(verseId)) {
          found = true;
          const parallelCount = parallels[group].length;
          if (parallelCount === 1) {
            verseElement.classList.add('pastel-green');
          } else if (parallelCount === 2) {
            verseElement.classList.add('pastel-purple');
          } else if (parallelCount >= 3) {
            verseElement.classList.add('pastel-pink');
          }
          break;
        }
      }

      if (!found) {
        verseElement.classList.add('unique');
      }

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
  console.log(`Clicked verse ID: ${verseId}`);

  let foundGroup = null;

  // Find the group that contains this verseId
  for (const group in parallels) {
    if (parallels[group].includes(verseId)) {
      foundGroup = parallels[group];
      break;
    }
  }

  if (foundGroup) {
    console.log(`Parallel verses for ${verseId}: ${foundGroup}`);
  } else {
    console.warn(`No parallels found for verse ID: ${verseId}`);
    return; // Exit if no parallels found
  }

  // Remove previous highlights
  document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));

  event.target.classList.add('highlight');

  // Highlight all verses in the found group
  foundGroup.forEach(parallelVerseId => {
    const parallelVerse = document.querySelector(`p[data-verse="${parallelVerseId}"]`);
    if (parallelVerse) {
      console.log(`Highlighting parallel verse ID: ${parallelVerseId}`);
      parallelVerse.classList.add('highlight');
      scrollToVerse(parallelVerse);
    } else {
      console.warn(`Parallel verse ID not found in DOM: ${parallelVerseId}`);
    }
  });

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
