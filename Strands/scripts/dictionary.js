// scripts/dictionary.js

class TrieNode {
    constructor() {
        this.children = {};
        this.isWord = false;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let node = this.root;
        for (const char of word) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isWord = true;
    }
}

// Loads the dictionary file and returns a Trie of valid words
window.loadTrieDictionary = async function () {
    try {
        const url = chrome.runtime.getURL('dictionary.json');
        const response = await fetch(url);
        const words = await response.json();

        const trie = new Trie();
        console.log("Building trie...");

        let count = 0;
        for (const word of words) {
            const w = word.trim().toLowerCase();
            if (w.length >= 4) {
                trie.insert(w);
                count++;
            }
        }
        console.log(`Dictionary loaded with ${count} words (>= 4 chars).`);
        return trie;
    } catch (e) {
        console.log(`Error loading dictionary: ${e}`);
        alert("Error loading dictionary file. Check manifest.json permissions.");
        return null;
    }
}
