/**
 * Dictionary Initialization Module
 * Reads words from words_alpha.txt and builds:
 * - dictSet: Set of all valid words (>= 4 chars)
 * - prefixSet: Set of all prefixes for pruning
 * 
 * Built once at module load, exported for use by word_search.js
 */

const fs = require('fs');
const path = require('path');

const MIN_WORD_LENGTH = 4;

// Load words from file
const wordsFilePath = path.join(__dirname, 'words_alpha.txt');
const rawWords = fs.readFileSync(wordsFilePath, 'utf-8')
    .split('\n')
    .map(w => w.trim().toUpperCase())
    .filter(w => w.length >= MIN_WORD_LENGTH);

console.log(`Loading dictionary: ${rawWords.length} words (>= ${MIN_WORD_LENGTH} chars)`);

// Build dictionary set
const dictSet = new Set(rawWords);

// Build prefix set
const prefixSet = new Set();
for (const word of rawWords) {
    for (let i = MIN_WORD_LENGTH; i <= word.length; i++) {
        prefixSet.add(word.slice(0, i));
    }
}

console.log(`Dictionary ready: ${dictSet.size} words, ${prefixSet.size} prefixes`);

module.exports = { dictSet, prefixSet, MIN_WORD_LENGTH };
