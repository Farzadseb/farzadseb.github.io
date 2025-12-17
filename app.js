// Dictionary App - Enhanced Version
let dictionaryData = {};
let appState = {
    muted: false,
    lastSpoken: null,
    favorites: new Set(JSON.parse(localStorage.getItem('dictionaryFavorites')) || []),
    searchHistory: JSON.parse(localStorage.getItem('dictionaryHistory')) || []
};

/* ---------- Initialize App ---------- */
document.addEventListener('DOMContentLoaded', () => {
    loadDictionary();
    setupEventListeners();
    loadSearchHistory();
    showWelcomeMessage();
});

/* ---------- Load Dictionary ---------- */
async function loadDictionary() {
    try {
        const response = await fetch("pdcs_a1.json");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        dictionaryData = await response.json();
        console.log(`✅ Dictionary loaded: ${Object.keys(dictionaryData).length} words`);
        
        // Preload popular words
        preloadPopularWords();
        
    } catch (error) {
        console.error('❌ Failed to load dictionary:', error);
        showError('Failed to load dictionary data. Please try again later.');
    }
}

/* ---------- Enhanced Speech Function ---------- */
function speak(text, options = {}) {
    if (appState.muted || !text || !window.speechSynthesis) return;
    
    speechSynthesis.cancel();
    appState.lastSpoken = text;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = options.rate || 0.75;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    // Try to get a better voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
        voice.lang.includes('en') && (voice.name.includes('Female') || voice.name.includes('Google'))
    );
    
    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }
    
    // Add visual feedback
    const speakingEvent = new CustomEvent('speaking', { detail: { text, isSpeaking: true } });
    document.dispatchEvent(speakingEvent);
    
    utterance.onstart = () => {
        document.dispatchEvent(new CustomEvent('speechStarted'));
    };
    
    utterance.onend = utterance.onerror = () => {
        document.dispatchEvent(new CustomEvent('speechEnded'));
    };
    
    speechSynthesis.speak(utterance);
    return utterance;
}

/* ---------- Enhanced Search ---------- */
function searchWord(searchTerm = null) {
    const searchInput = document.getElementById("searchInput");
    const resultDiv = document.getElementById("result");
    const term = searchTerm || searchInput.value.trim().toLowerCase();
    
    if (!term) {
        resultDiv.innerHTML = getEmptyStateHTML();
        return;
    }
    
    searchInput.value = term;
    resultDiv.innerHTML = getLoadingHTML();
    
    // Check cache first for performance
    const cachedResult = getCachedResult(term);
    if (cachedResult) {
        setTimeout(() => displayResult(term, cachedResult), 50);
        return;
    }
    
    setTimeout(() => {
        const wordData = dictionaryData[term];
        
        if (!wordData) {
            displayNotFound(term);
            return;
        }
        
        // Speak the word if not muted
        if (!appState.muted) {
            speak(term);
        }
        
        // Save to search history
        addToHistory(term);
        
        // Display the result
        displayResult(term, wordData);
        
        // Cache the result
        cacheResult(term, wordData);
        
    }, 100);
}

/* ---------- Display Result ---------- */
function displayResult(word, wordData) {
    const resultDiv = document.getElementById("result");
    const isFavorite = appState.favorites.has(word);
    
    const html = `
        <div class="card">
            <div class="word-header">
                <h1 class="word">${word}</h1>
                <div class="word-actions">
                    <button class="action-btn ${isFavorite ? 'active' : ''}" 
                            onclick="toggleFavorite('${word}')" 
                            title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                        ${isFavorite ? '★' : '☆'}
                    </button>
                    <button class="action-btn" onclick="speak('${word}')" title="Listen pronunciation">
                        🔊
                    </button>
                    <button class="action-btn" onclick="copyToClipboard('${word}')" title="Copy word">
                        📋
                    </button>
                </div>
            </div>
            
            ${wordData.phonetic ? `<div class="phonetic">/${wordData.phonetic}/</div>` : ''}
            
            <div class="section">
                <div class="section-title">📖 Definition</div>
                <div class="box" onclick="speak('${escapeText(wordData.def)}')">
                    <div class="en">${wordData.def}</div>
                    ${wordData.fa ? `<div class="fa-text">${wordData.fa}</div>` : ''}
                </div>
            </div>
            
            ${wordData.example && wordData.example.en ? `
            <div class="section">
                <div class="section-title">💬 Example</div>
                <div class="box" onclick="speak('${escapeText(wordData.example.en)}')">
                    <div class="en">"${wordData.example.en}"</div>
                    ${wordData.example.fa ? `<div class="fa-text">${wordData.example.fa}</div>` : ''}
                </div>
            </div>
            ` : ''}
            
            ${wordData.collocations && wordData.collocations.length > 0 ? `
            <div class="section">
                <div class="section-title">🔗 Collocations</div>
                ${wordData.collocations.map(collocation => `
                    <div class="box collocation" onclick="speak('${escapeText(collocation.en)}')">
                        <div class="en">${collocation.en}</div>
                        ${collocation.fa ? `<div class="fa-text">${collocation.fa}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${wordData.phrasal_verbs && wordData.phrasal_verbs.length > 0 ? `
            <div class="section">
                <div class="section-title">⚡ Phrasal Verbs</div>
                ${wordData.phrasal_verbs.map(verb => `
                    <div class="box phrasal-verb" onclick="speak('${escapeText(verb.en)}')">
                        <div class="en">${verb.en}</div>
                        ${verb.fa ? `<div class="fa-text">${verb.fa}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${wordData.synonyms && wordData.synonyms.length > 0 ? `
            <div class="section">
                <div class="section-title">🔄 Synonyms</div>
                <div class="synonyms">
                    ${wordData.synonyms.map(synonym => `
                        <span class="synonym-tag" onclick="searchWord('${synonym}')">${synonym}</span>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="word-footer">
                <div class="word-meta">
                    <span class="meta-item">📚 Level: ${wordData.level || 'A1'}</span>
                    <span class="meta-item">🏷️ Part of Speech: ${wordData.pos || 'Not specified'}</span>
                    <span class="meta-item">📅 Last searched: ${new Date().toLocaleDateString()}</span>
                </div>
                <button class="leitner-btn" onclick="addToLeitner('${word}')">
                    📚 Add to Leitner System
                </button>
            </div>
        </div>
    `;
    
    resultDiv.innerHTML = html;
    highlightSearchTerm(word);
}

/* ---------- Utility Functions ---------- */
function escapeText(text) {
    return text ? text.replace(/'/g, "\\'").replace(/"/g, '&quot;') : '';
}

function toggleFavorite(word) {
    if (appState.favorites.has(word)) {
        appState.favorites.delete(word);
        showNotification(`"${word}" removed from favorites`, 'info');
    } else {
        appState.favorites.add(word);
        showNotification(`"${word}" added to favorites`, 'success');
    }
    
    // Save to localStorage
    localStorage.setItem('dictionaryFavorites', JSON.stringify([...appState.favorites]));
    
    // Update UI
    const favoriteBtn = document.querySelector(`button[onclick="toggleFavorite('${word}')"]`);
    if (favoriteBtn) {
        favoriteBtn.classList.toggle('active');
        favoriteBtn.innerHTML = appState.favorites.has(word) ? '★' : '☆';
        favoriteBtn.title = appState.favorites.has(word) ? 'Remove from favorites' : 'Add to favorites';
    }
}

function addToLeitner(word) {
    let leitner = JSON.parse(localStorage.getItem('leitner')) || {};
    
    if (leitner[word]) {
        showNotification(`"${word}" is already in your Leitner system`, 'info');
        return;
    }
    
    leitner[word] = {
        box: 1,
        added: new Date().toISOString(),
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        reviews: 0,
        correctAnswers: 0
    };
    
    localStorage.setItem('leitner', JSON.stringify(leitner));
    showNotification(`"${word}" added to Leitner system successfully!`, 'success');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification(`"${text}" copied to clipboard`, 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy text', 'error');
    });
}

/* ---------- Search History ---------- */
function addToHistory(word) {
    if (!word) return;
    
    // Remove if already exists
    appState.searchHistory = appState.searchHistory.filter(w => w !== word);
    
    // Add to beginning
    appState.searchHistory.unshift(word);
    
    // Keep only last 20 items
    appState.searchHistory = appState.searchHistory.slice(0, 20);
    
    localStorage.setItem('dictionaryHistory', JSON.stringify(appState.searchHistory));
    updateHistoryDisplay();
}

function loadSearchHistory() {
    const history = JSON.parse(localStorage.getItem('dictionaryHistory')) || [];
    appState.searchHistory = history;
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyContainer = document.getElementById('searchHistory');
    if (!historyContainer) return;
    
    if (appState.searchHistory.length === 0) {
        historyContainer.innerHTML = '<p class="empty-history">No recent searches</p>';
        return;
    }
    
    historyContainer.innerHTML = `
        <div class="history-title">Recent Searches:</div>
        <div class="history-items">
            ${appState.searchHistory.map(word => `
                <span class="history-item" onclick="searchWord('${word}')">${word}</span>
            `).join('')}
        </div>
        <button class="clear-history" onclick="clearHistory()">Clear History</button>
    `;
}

function clearHistory() {
    appState.searchHistory = [];
    localStorage.removeItem('dictionaryHistory');
    updateHistoryDisplay();
    showNotification('Search history cleared', 'info');
}

/* ---------- Cache System ---------- */
const resultCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function cacheResult(word, data) {
    resultCache.set(word, {
        data: data,
        timestamp: Date.now()
    });
}

function getCachedResult(word) {
    const cached = resultCache.get(word);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
        resultCache.delete(word);
        return null;
    }
    
    return cached.data;
}

/* ---------- UI Helper Functions ---------- */
function getLoadingHTML() {
    return `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Searching...</p>
        </div>
    `;
}

function getEmptyStateHTML() {
    return `
        <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>Search for a word</h3>
            <p>Type an English word in the search box above to see its definition, examples, and more.</p>
            <div class="suggestions">
                <p>Try searching for: hello, good, time, day, water</p>
            </div>
        </div>
    `;
}

function displayNotFound(word) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `
        <div class="not-found-state">
            <div class="not-found-icon">❌</div>
            <h3>Word not found</h3>
            <p>The word "<strong>${word}</strong>" was not found in the dictionary.</p>
            <p class="suggestion">Check your spelling or try another word.</p>
            
            <div class="similar-words">
                <p>Did you mean:</p>
                ${findSimilarWords(word).slice(0, 5).map(similar => `
                    <button class="similar-word" onclick="searchWord('${similar}')">${similar}</button>
                `).join('')}
            </div>
        </div>
    `;
}

function findSimilarWords(word) {
    const allWords = Object.keys(dictionaryData);
    return allWords.filter(w => 
        w.startsWith(word) || 
        word.startsWith(w) || 
        calculateSimilarity(w, word) > 0.7
    ).slice(0, 10);
}

function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    return (longer.length - editDistance(longer, shorter)) / parseFloat(longer.length);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) costs[j] = j;
            else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

function highlightSearchTerm(word) {
    // You can implement text highlighting here if needed
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-text">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

function showError(message) {
    showNotification(message, 'error');
}

function showWelcomeMessage() {
    if (!localStorage.getItem('dictionaryWelcomeShown')) {
        showNotification('Welcome to the Dictionary! Search for any word to begin.', 'success');
        localStorage.setItem('dictionaryWelcomeShown', 'true');
    }
}

function preloadPopularWords() {
    // Preload commonly searched words for better performance
    const popularWords = ['hello', 'good', 'time', 'day', 'water', 'food', 'house', 'school', 'book', 'friend'];
    popularWords.forEach(word => {
        if (dictionaryData[word]) {
            cacheResult(word, dictionaryData[word]);
        }
    });
}

/* ---------- Event Listeners ---------- */
function setupEventListeners() {
    const searchInput = document.getElementById("searchInput");
    const muteBtn = document.getElementById("muteBtn");
    
    // Search on Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchWord();
        }
    });
    
    // Real-time search suggestions (optional)
    searchInput.addEventListener('input', debounce((e) => {
        const term = e.target.value.trim();
        if (term.length > 1) {
            showSearchSuggestions(term);
        }
    }, 300));
    
    // Toggle mute
    muteBtn.onclick = () => {
        appState.muted = !appState.muted;
        muteBtn.innerHTML = appState.muted ? 
            '<span class="mute-icon">🔈</span> Sound On' : 
            '<span class="mute-icon">🔇</span> Mute';
        muteBtn.classList.toggle('muted', appState.muted);
        
        showNotification(appState.muted ? 'Sound muted' : 'Sound unmuted', 'info');
    };
    
    // Listen for speech events
    document.addEventListener('speechStarted', () => {
        document.querySelectorAll('.speaking').forEach(el => el.classList.remove('speaking'));
    });
    
    document.addEventListener('speechEnded', () => {
        // Handle speech end if needed
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showSearchSuggestions(term) {
    // Implement search suggestions dropdown
    const suggestions = Object.keys(dictionaryData)
        .filter(word => word.toLowerCase().startsWith(term.toLowerCase()))
        .slice(0, 5);
    
    // You can create a dropdown here with these suggestions
                      }
