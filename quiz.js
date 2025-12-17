// Quiz State Management
const quizState = {
    data: {},
    keys: [],
    currentWord: "",
    mode: 1,
    lastSpoken: "",
    questionCount: 0,
    correctCount: 0,
    wrongCount: 0,
    currentStreak: 0,
    maxStreak: 0,
    selectedAnswer: null,
    isAnswered: false,
    usedWords: new Set(),
    quizSettings: {
        soundEnabled: true,
        autoSpeak: true,
        showFeedback: true,
        difficulty: 'normal' // normal, hard, expert
    }
};

// DOM Elements
const elements = {
    modeBox: document.getElementById("modeBox"),
    choices: document.getElementById("choices"),
    questionCounter: document.getElementById("questionCounter"),
    statsCorrect: document.getElementById("statsCorrect"),
    statsWrong: document.getElementById("statsWrong"),
    statsStreak: document.getElementById("statsStreak"),
    feedback: document.getElementById("feedback"),
    nextBtn: document.getElementById("nextBtn"),
    listenBtn: document.getElementById("listenBtn"),
    speakerIcon: document.getElementById("speakerIcon"),
    progressBar: document.getElementById("progressBar"),
    progressText: document.getElementById("progressText")
};

// Initialize Quiz
document.addEventListener("DOMContentLoaded", () => {
    loadQuizData();
    loadSettings();
    loadStats();
    setupEventListeners();
});

// Load Quiz Data
async function loadQuizData() {
    try {
        const response = await fetch("pdcs_a1.json");
        if (!response.ok) throw new Error("Failed to load data");
        
        const jsonData = await response.json();
        quizState.data = jsonData.words || jsonData;
        quizState.keys = Object.keys(quizState.data);
        
        if (quizState.keys.length < 4) {
            showError("Need at least 4 words in the database");
            return;
        }
        
        // Initialize UI
        updateStatsDisplay();
        nextQuestion();
        
    } catch (error) {
        console.error("Error loading quiz data:", error);
        showError("Failed to load vocabulary data. Please try again.");
    }
}

// Improved Speak Function
function speak(text, options = {}) {
    if (!text || !quizState.quizSettings.soundEnabled) return;
    
    speechSynthesis.cancel();
    quizState.lastSpoken = text;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = options.rate || 0.75;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    // Try to get a better voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
        voice.lang.includes('en') && voice.name.includes('Female')
    );
    
    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }
    
    // Add visual feedback
    if (elements.speakerIcon) {
        elements.speakerIcon.style.animation = "pulse 1s";
        utterance.onend = () => {
            elements.speakerIcon.style.animation = "";
        };
    }
    
    speechSynthesis.speak(utterance);
}

// Setup Event Listeners
function setupEventListeners() {
    // Listen button
    if (elements.listenBtn) {
        elements.listenBtn.addEventListener("click", () => {
            speak(quizState.lastSpoken);
        });
    }
    
    // Next button
    if (elements.nextBtn) {
        elements.nextBtn.addEventListener("click", nextQuestion);
    }
    
    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !quizState.isAnswered) {
            // Auto-select first choice? Or other action
        }
        
        // Number keys 1-4 for answer selection
        if (!quizState.isAnswered && e.key >= "1" && e.key <= "4") {
            const index = parseInt(e.key) - 1;
            const buttons = elements.choices.querySelectorAll("button");
            if (buttons[index]) {
                buttons[index].click();
            }
        }
        
        // Space to repeat speech
        if (e.code === "Space") {
            e.preventDefault();
            speak(quizState.lastSpoken);
        }
        
        // N for next question
        if (e.key === "n" || e.key === "N") {
            if (quizState.isAnswered) {
                nextQuestion();
            }
        }
    });
}

// Load and Save Settings
function loadSettings() {
    const saved = localStorage.getItem("quizSettings");
    if (saved) {
        try {
            quizState.quizSettings = { ...quizState.quizSettings, ...JSON.parse(saved) };
        } catch (e) {
            console.error("Error loading settings:", e);
        }
    }
    
    // Apply settings to UI
    updateSettingsUI();
}

function saveSettings() {
    localStorage.setItem("quizSettings", JSON.stringify(quizState.quizSettings));
}

function updateSettingsUI() {
    // Update any UI elements based on settings
    // Example: mute button state
}

// Statistics Management
function loadStats() {
    const saved = localStorage.getItem("quizStats");
    if (saved) {
        try {
            const stats = JSON.parse(saved);
            quizState.correctCount = stats.correct || 0;
            quizState.wrongCount = stats.wrong || 0;
            quizState.currentStreak = stats.streak || 0;
            quizState.maxStreak = stats.maxStreak || 0;
            quizState.questionCount = stats.totalQuestions || 0;
        } catch (e) {
            console.error("Error loading stats:", e);
        }
    }
}

function saveStats() {
    const stats = {
        correct: quizState.correctCount,
        wrong: quizState.wrongCount,
        streak: quizState.currentStreak,
        maxStreak: quizState.maxStreak,
        totalQuestions: quizState.questionCount,
        lastPlayed: new Date().toISOString()
    };
    localStorage.setItem("quizStats", JSON.stringify(stats));
}

function updateStatsDisplay() {
    if (elements.statsCorrect) elements.statsCorrect.textContent = quizState.correctCount;
    if (elements.statsWrong) elements.statsWrong.textContent = quizState.wrongCount;
    if (elements.statsStreak) elements.statsStreak.textContent = quizState.currentStreak;
    
    // Update progress
    if (elements.progressBar && elements.progressText) {
        const total = quizState.correctCount + quizState.wrongCount;
        const percentage = total > 0 ? Math.round((quizState.correctCount / total) * 100) : 0;
        elements.progressBar.style.width = `${percentage}%`;
        elements.progressText.textContent = `${percentage}%`;
    }
}

// Main Quiz Functions
function nextQuestion() {
    if (quizState.keys.length < 4) {
        showError("Not enough words available");
        return;
    }
    
    // Reset state
    resetQuestionState();
    
    // Select word (avoid recent words)
    selectNewWord();
    
    // Update counter
    quizState.questionCount++;
    if (elements.questionCounter) {
        elements.questionCounter.textContent = quizState.questionCount;
    }
    
    // Determine mode
    quizState.mode = Math.floor(Math.random() * 3) + 1;
    
    // Setup question based on mode
    setupQuestion();
    
    // Create answer choices
    createAnswerChoices();
    
    // Auto-speak if enabled
    if (quizState.quizSettings.autoSpeak) {
        autoSpeakQuestion();
    }
}

function resetQuestionState() {
    quizState.isAnswered = false;
    quizState.selectedAnswer = null;
    
    if (elements.choices) {
        elements.choices.innerHTML = "";
    }
    
    if (elements.feedback) {
        elements.feedback.textContent = "";
        elements.feedback.className = "feedback";
    }
    
    if (elements.nextBtn) {
        elements.nextBtn.disabled = true;
        elements.nextBtn.style.opacity = "0.6";
    }
}

function selectNewWord() {
    // Try to avoid recently used words
    const availableWords = quizState.keys.filter(word => !quizState.usedWords.has(word));
    
    if (availableWords.length === 0) {
        // Reset if all words have been used
        quizState.usedWords.clear();
        quizState.currentWord = quizState.keys[Math.floor(Math.random() * quizState.keys.length)];
    } else {
        quizState.currentWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    }
    
    quizState.usedWords.add(quizState.currentWord);
    
    // Keep used words list manageable
    if (quizState.usedWords.size > 20) {
        const firstItem = Array.from(quizState.usedWords)[0];
        quizState.usedWords.delete(firstItem);
    }
}

function setupQuestion() {
    const wordData = quizState.data[quizState.currentWord];
    if (!wordData) return;
    
    let modeText = "";
    
    switch (quizState.mode) {
        case 1: // English → Persian
            modeText = "English → Persian Translation";
            if (elements.modeBox) {
                elements.modeBox.innerHTML = '<i class="fas fa-language"></i> ' + modeText;
            }
            break;
            
        case 2: // English → Definition
            modeText = "English → Definition";
            if (elements.modeBox) {
                elements.modeBox.innerHTML = '<i class="fas fa-book"></i> ' + modeText;
            }
            break;
            
        case 3: // Definition → Persian
            modeText = "Listen to Definition → Persian";
            if (elements.modeBox) {
                elements.modeBox.innerHTML = '<i class="fas fa-headphones"></i> ' + modeText;
            }
            break;
    }
}

function autoSpeakQuestion() {
    const wordData = quizState.data[quizState.currentWord];
    if (!wordData) return;
    
    switch (quizState.mode) {
        case 1:
        case 2:
            speak(quizState.currentWord);
            break;
        case 3:
            speak(wordData.def);
            break;
    }
}

function createAnswerChoices() {
    const wordData = quizState.data[quizState.currentWord];
    if (!wordData || !elements.choices) return;
    
    let correctAnswer = "";
    let answerPool = [];
    
    // Determine correct answer and create pool
    switch (quizState.mode) {
        case 1: // English → Persian
            correctAnswer = wordData.fa;
            answerPool = quizState.keys
                .filter(key => key !== quizState.currentWord)
                .map(key => quizState.data[key].fa)
                .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
            break;
            
        case 2: // English → Definition
            correctAnswer = wordData.def;
            answerPool = quizState.keys
                .filter(key => key !== quizState.currentWord)
                .map(key => quizState.data[key].def)
                .filter((value, index, self) => self.indexOf(value) === index);
            break;
            
        case 3: // Definition → Persian
            correctAnswer = wordData.fa;
            answerPool = quizState.keys
                .filter(key => key !== quizState.currentWord)
                .map(key => quizState.data[key].fa)
                .filter((value, index, self) => self.indexOf(value) === index);
            break;
    }
    
    // Ensure we have enough answers
    const numChoices = 4;
    const answers = [correctAnswer];
    
    // Select wrong answers
    while (answers.length < numChoices && answerPool.length > 0) {
        const randomIndex = Math.floor(Math.random() * answerPool.length);
        const randomAnswer = answerPool[randomIndex];
        
        if (!answers.includes(randomAnswer)) {
            answers.push(randomAnswer);
        }
        
        // Remove to avoid infinite loop
        answerPool.splice(randomIndex, 1);
    }
    
    // Shuffle answers
    shuffleArray(answers);
    
    // Create buttons
    answers.forEach((answer, index) => {
        const button = document.createElement("button");
        button.className = "choice-btn";
        button.textContent = answer;
        button.dataset.answer = answer;
        button.dataset.correct = answer === correctAnswer;
        
        // Add keyboard shortcut indicator
        const shortcut = document.createElement("span");
        shortcut.className = "shortcut";
        shortcut.textContent = `${index + 1}`;
        button.appendChild(shortcut);
        
        button.addEventListener("click", () => checkAnswer(button, answer, correctAnswer));
        
        elements.choices.appendChild(button);
    });
}

function checkAnswer(button, selectedAnswer, correctAnswer) {
    if (quizState.isAnswered) return;
    
    quizState.isAnswered = true;
    quizState.selectedAnswer = selectedAnswer;
    
    // Disable all buttons
    const allButtons = elements.choices.querySelectorAll("button");
    allButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = "not-allowed";
    });
    
    // Check if correct
    const isCorrect = selectedAnswer === correctAnswer;
    
    // Visual feedback
    if (isCorrect) {
        button.classList.add("correct");
        handleCorrectAnswer();
    } else {
        button.classList.add("wrong");
        handleWrongAnswer(correctAnswer);
    }
    
    // Show feedback
    showFeedback(isCorrect);
    
    // Enable next button
    if (elements.nextBtn) {
        elements.nextBtn.disabled = false;
        elements.nextBtn.style.opacity = "1";
    }
    
    // Update stats
    updateStats();
    
    // Auto-advance after delay
    if (quizState.quizSettings.autoAdvance) {
        setTimeout(nextQuestion, 2000);
    }
}

function handleCorrectAnswer() {
    quizState.correctCount++;
    quizState.currentStreak++;
    
    if (quizState.currentStreak > quizState.maxStreak) {
        quizState.maxStreak = quizState.currentStreak;
    }
    
    // Optional: Add to mastered words
    addToMastered(quizState.currentWord);
}

function handleWrongAnswer(correctAnswer) {
    quizState.wrongCount++;
    quizState.currentStreak = 0;
    
    // Highlight correct answer
    const allButtons = elements.choices.querySelectorAll("button");
    allButtons.forEach(btn => {
        if (btn.dataset.correct === "true") {
            btn.classList.add("correct");
        }
    });
    
    // Save to Leitner system for review
    saveToLeitner(quizState.currentWord);
}

function showFeedback(isCorrect) {
    if (!elements.feedback || !quizState.quizSettings.showFeedback) return;
    
    const wordData = quizState.data[quizState.currentWord];
    
    if (isCorrect) {
        elements.feedback.className = "feedback correct";
        elements.feedback.innerHTML = `
            <div class="feedback-content">
                <i class="fas fa-check-circle"></i>
                <strong>Correct!</strong>
                <div class="word-info">
                    ${quizState.currentWord} → ${wordData.fa}
                    <br>
                    <small>${wordData.def}</small>
                </div>
            </div>
        `;
    } else {
        elements.feedback.className = "feedback wrong";
        elements.feedback.innerHTML = `
            <div class="feedback-content">
                <i class="fas fa-times-circle"></i>
                <strong>Incorrect</strong>
                <div class="word-info">
                    The correct answer was: <strong>${wordData.fa}</strong>
                    <br>
                    <small>${wordData.def}</small>
                </div>
            </div>
        `;
    }
}

function updateStats() {
    updateStatsDisplay();
    saveStats();
}

// Utility Functions
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function saveToLeitner(word) {
    let leitner = JSON.parse(localStorage.getItem("leitner")) || {};
    const now = Date.now();
    
    leitner[word] = {
        box: 1,
        lastReviewed: now,
        nextReview: now + 24 * 60 * 60 * 1000, // 1 day
        reviews: (leitner[word]?.reviews || 0) + 1,
        difficulty: 'hard' // Mark as difficult word
    };
    
    localStorage.setItem("leitner", JSON.stringify(leitner));
}

function addToMastered(word) {
    let mastered = JSON.parse(localStorage.getItem("masteredWords")) || [];
    if (!mastered.includes(word)) {
        mastered.push(word);
        localStorage.setItem("masteredWords", JSON.stringify(mastered));
    }
}

function showError(message) {
    console.error(message);
    // You could show this in the UI
    if (elements.modeBox) {
        elements.modeBox.textContent = message;
        elements.modeBox.style.color = "#dc3545";
    }
}

// CSS for improvements (add to your existing CSS)
const additionalStyles = `
    .choice-btn {
        position: relative;
        transition: all 0.3s ease;
    }
    
    .choice-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .choice-btn.correct {
        background-color: #d4edda;
        border-color: #c3e6cb;
        color: #155724;
        animation: pulseCorrect 0.5s;
    }
    
    .choice-btn.wrong {
        background-color: #f8d7da;
        border-color: #f5c6cb;
        color: #721c24;
        animation: shake 0.5s;
    }
    
    .shortcut {
        position: absolute;
        top: 5px;
        right: 10px;
        font-size: 0.8rem;
        opacity: 0.6;
    }
    
    .feedback {
        padding: 15px;
        border-radius: 10px;
        margin-top: 20px;
        animation: fadeIn 0.3s;
    }
    
    .feedback.correct {
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
    }
    
    .feedback.wrong {
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
    }
    
    .feedback-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .word-info {
        flex: 1;
    }
    
    @keyframes pulseCorrect {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
