// Content script that runs on NYT Strands page
console.log('Strands Grid Extractor: Content script loaded');

let dictionaryLoaded = false;

// Load dictionary when content script loads
async function loadDictionary() {
    if (dictionaryLoaded) return;

    try {
        const url = chrome.runtime.getURL('dictionary.json');
        const response = await fetch(url);
        const words = await response.json();
        initDictionary(words);
        dictionaryLoaded = true;
        console.log('Dictionary loaded successfully');
    } catch (error) {
        console.error('Failed to load dictionary:', error);
    }
}

// Extract grid from the page
function extractGrid() {
    try {
        const letters = [];

        // Find all elements that might contain single letters in the game area
        const allElements = document.querySelectorAll('*');

        for (const el of allElements) {
            if (el.children.length === 0) {
                const text = el.textContent?.trim();
                if (text && text.length === 1 && /[A-Za-z]/.test(text)) {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0 && rect.width < 100) {
                        letters.push({
                            letter: text.toUpperCase(),
                            x: rect.x,
                            y: rect.y
                        });
                    }
                }
            }
        }

        // Sort by position (top to bottom, left to right)
        letters.sort((a, b) => {
            const rowDiff = Math.round((a.y - b.y) / 30);
            if (rowDiff !== 0) return rowDiff;
            return a.x - b.x;
        });

        const flatGrid = letters.map(l => l.letter);

        if (flatGrid.length < 48) {
            console.error(`Only found ${flatGrid.length} letters, need 48`);
            return null;
        }

        return flatToGrid(flatGrid.slice(0, 48));
    } catch (error) {
        console.error('Grid extraction failed:', error);
        return null;
    }
}

// Main function to extract grid and find words
async function findWordsInGrid() {
    await loadDictionary();

    const grid = extractGrid();
    if (!grid) {
        console.error('Could not extract grid from page');
        return null;
    }

    console.log('Extracted grid:');
    grid.forEach((row, i) => console.log(`Row ${i}: ${row.join(' ')}`));

    const start = performance.now();
    const results = findAllWords(grid);
    const elapsed = (performance.now() - start).toFixed(2);

    console.log(`\n=== Found ${results.length} words in ${elapsed}ms ===\n`);

    // Print all words grouped by length
    const byLength = {};
    for (const r of results) {
        const len = r.word.length;
        if (!byLength[len]) byLength[len] = [];
        byLength[len].push(r.word);
    }

    for (const len of Object.keys(byLength).sort((a, b) => b - a)) {
        console.log(`${len} letters: ${byLength[len].join(', ')}`);
    }

    return results;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'findWords') {
        findWordsInGrid().then(results => {
            sendResponse({ success: true, results });
        }).catch(error => {
            sendResponse({ success: false, error: error.message });
        });
        return true; // Keep channel open for async response
    }

    if (request.action === 'extractGrid') {
        const grid = extractGrid();
        sendResponse({ grid });
        return true;
    }
});

// Auto-run when page loads (optional)
window.addEventListener('load', () => {
    console.log('Page loaded. Click extension icon or run findWordsInGrid() in console.');
});
