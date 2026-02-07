document.addEventListener('DOMContentLoaded', () => {
  const findBtn = document.getElementById('extractBtn');
  const status = document.getElementById('status');
  const gridContainer = document.getElementById('gridContainer');

  findBtn.textContent = 'Find Words';

  findBtn.addEventListener('click', async () => {
    try {
      status.textContent = 'Injecting word finder...';
      status.className = 'status';

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.url || !tab.url.includes('nytimes.com/games/strands')) {
        status.textContent = 'Please navigate to NYT Strands first!';
        status.className = 'status error';
        return;
      }

      // Inject and execute directly - results go to page console
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: runWordFinder,
        args: [chrome.runtime.getURL('dictionary.json')]
      });

      status.textContent = 'Running! Check page console (F12) for results.';
      status.className = 'status success';

    } catch (error) {
      console.error('Error:', error);
      status.textContent = `Error: ${error.message}`;
      status.className = 'status error';
    }
  });
});

// This function runs in the page context
function runWordFinder(dictionaryUrl) {
  const ROWS = 8;
  const COLS = 6;
  const MIN_WORD_LENGTH = 4;
  const MAX_WORD_LENGTH = 15;

  const DIRECTIONS = [
    { dr: 0, dc: 1 }, { dr: 0, dc: -1 },
    { dr: 1, dc: 0 }, { dr: -1, dc: 0 },
    { dr: 1, dc: 1 }, { dr: 1, dc: -1 },
    { dr: -1, dc: 1 }, { dr: -1, dc: -1 }
  ];

  function flatToGrid(flatGrid) {
    const grid = [];
    for (let row = 0; row < ROWS; row++) {
      grid.push(flatGrid.slice(row * COLS, (row + 1) * COLS));
    }
    return grid;
  }

  function findAllWords(grid, dictSet, prefixSet) {
    const foundWords = new Map();

    function generatePaths(row, col, currentWord, visited, path) {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;
      const key = `${row},${col}`;
      if (visited.has(key)) return;

      const letter = grid[row][col].toUpperCase();
      const newWord = currentWord + letter;

      if (newWord.length >= MIN_WORD_LENGTH && !prefixSet.has(newWord)) return;
      if (newWord.length > MAX_WORD_LENGTH) return;

      visited.add(key);
      path.push({ row, col, letter });

      if (newWord.length >= MIN_WORD_LENGTH && dictSet.has(newWord)) {
        if (!foundWords.has(newWord)) {
          foundWords.set(newWord, [...path]);
        }
      }

      for (const dir of DIRECTIONS) {
        generatePaths(row + dir.dr, col + dir.dc, newWord, visited, path);
      }

      visited.delete(key);
      path.pop();
    }

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        generatePaths(row, col, '', new Set(), []);
      }
    }

    return Array.from(foundWords.entries())
      .map(([word, path]) => ({ word, positions: path }))
      .sort((a, b) => b.word.length - a.word.length);
  }

  function extractGrid() {
    const letters = [];
    const allElements = document.querySelectorAll('*');

    for (const el of allElements) {
      if (el.children.length === 0) {
        const text = el.textContent?.trim();
        if (text && text.length === 1 && /[A-Za-z]/.test(text)) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && rect.width < 100 && rect.height < 100) {
            letters.push({
              letter: text.toUpperCase(),
              x: rect.x,
              y: rect.y
            });
          }
        }
      }
    }

    letters.sort((a, b) => {
      const rowDiff = Math.round((a.y - b.y) / 30);
      if (rowDiff !== 0) return rowDiff;
      return a.x - b.x;
    });

    return letters.map(l => l.letter);
  }

  // Main execution
  (async () => {
    console.log('%c=== STRANDS WORD FINDER ===', 'color: #4ade80; font-size: 16px; font-weight: bold;');

    // Extract grid
    console.log('Extracting grid...');
    const flatGrid = extractGrid();

    if (flatGrid.length < 48) {
      console.error(`Only found ${flatGrid.length} letters, need 48. Grid extraction failed.`);
      return;
    }

    const grid = flatToGrid(flatGrid.slice(0, 48));
    console.log('Grid extracted:');
    grid.forEach((row, i) => console.log(`  Row ${i}: ${row.join(' ')}`));

    // Load dictionary
    console.log('Loading dictionary (this may take a few seconds)...');
    const response = await fetch(dictionaryUrl);
    const words = await response.json();
    console.log(`Loaded ${words.length} words`);

    // Build sets
    console.log('Building prefix set...');
    const dictSet = new Set(words);
    const prefixSet = new Set();
    for (const word of words) {
      for (let i = MIN_WORD_LENGTH; i <= word.length; i++) {
        prefixSet.add(word.slice(0, i));
      }
    }
    console.log(`Built ${prefixSet.size} prefixes`);

    // Find words
    console.log('Searching for words...');
    const start = performance.now();
    const results = findAllWords(grid, dictSet, prefixSet);
    const elapsed = (performance.now() - start).toFixed(2);

    // Print results
    console.log(`%c\n=== Found ${results.length} words in ${elapsed}ms ===\n`, 'color: #4ade80; font-size: 14px;');

    // Group by length
    const byLength = {};
    for (const r of results) {
      const len = r.word.length;
      if (!byLength[len]) byLength[len] = [];
      byLength[len].push(r.word);
    }

    for (const len of Object.keys(byLength).sort((a, b) => b - a)) {
      console.log(`%c${len} letters:`, 'color: #60a5fa; font-weight: bold;', byLength[len].join(', '));
    }

    // Store results globally for easy access
    window.strandsResults = results;
    console.log('%c\nResults stored in window.strandsResults', 'color: #888;');
  })();
}
