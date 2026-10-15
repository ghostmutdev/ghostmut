// app.js - Application logic
class JapaneseQuiz {
    constructor() {
        this.currentMode = null;
        this.questionList = [];
        this.currentIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.totalAnswered = 0;
        
        this.ui = {
            navBtns: document.querySelectorAll('.nav-btn'),
            characterDisplay: document.getElementById('characterDisplay'),
            hintDisplay: document.getElementById('hintDisplay'),
            answerInput: document.getElementById('answerInput'),
            submitBtn: document.querySelector('.submit-btn'),
            feedback: document.getElementById('feedback'),
            feedbackText: document.getElementById('feedbackText'),
            scoreDisplay: document.getElementById('scoreDisplay'),
            totalDisplay: document.getElementById('totalDisplay'),
            streakDisplay: document.getElementById('streakDisplay'),
            progressFill: document.getElementById('progressFill'),
            skipBtn: document.getElementById('skipBtn'),
            modeInfo: document.getElementById('modeInfo'),
            showRomaji: document.getElementById('showRomaji'),
            japaneseInput: document.getElementById('japaneseInput')
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        // Start with hiragana by default
        this.switchMode('hiragana');
    }
    
    setupEventListeners() {
        // Navigation buttons
        this.ui.navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.switchMode(mode);
            });
        });
        
        // Form submission
        document.getElementById('answerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.checkAnswer();
        });
        
        // Skip button
        this.ui.skipBtn.addEventListener('click', () => this.skipQuestion());
        
        // Enter key in input
        this.ui.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });
        
        // Settings checkboxes
        this.ui.showRomaji.addEventListener('change', () => this.updateHint());
        this.ui.japaneseInput.addEventListener('change', () => {
            this.ui.answerInput.setAttribute('inputmode', 
                this.ui.japaneseInput.checked ? 'text' : 'latin');
        });
    }
    
    switchMode(mode) {
        this.currentMode = mode;
        
        // Update navigation buttons
        this.ui.navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Load question list for this mode
        this.questionList = [...japaneseData[mode]];
        this.shuffleArray(this.questionList);
        this.currentIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.totalAnswered = 0;
        
        this.updateUI();
        this.showQuestion();
        this.updateModeInfo();
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    showQuestion() {
        if (this.currentIndex >= this.questionList.length) {
            this.resetQuiz();
            return;
        }
        
        const question = this.questionList[this.currentIndex];
        this.ui.characterDisplay.textContent = question.char;
        this.updateHint();
        this.ui.answerInput.value = '';
        this.ui.feedback.className = 'feedback';
        this.ui.feedback.style.display = 'none';
        this.ui.answerInput.focus();
        
        this.updateProgress();
    }
    
    updateHint() {
        const question = this.questionList[this.currentIndex];
        const showRomaji = this.ui.showRomaji.checked;
        
        if (showRomaji) {
            this.ui.hintDisplay.textContent = `Reading: ${question.romaji}`;
        } else {
            this.ui.hintDisplay.textContent = '';
        }
    }
    
    checkAnswer() {
        const answer = this.ui.answerInput.value.trim().toLowerCase();
        if (!answer) return;
        
        const question = this.questionList[this.currentIndex];
        const isValid = this.validateAnswer(answer, question);
        
        this.totalAnswered++;
        
        if (isValid) {
            this.score++;
            this.streak++;
            this.showFeedback(true, question);
        } else {
            this.streak = 0;
            this.showFeedback(false, question);
        }
        
        this.updateUI();
        
        // Auto-advance after delay
        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
    }
    
    validateAnswer(answer, question) {
        // Normalize Japanese characters to romaji
        let normalizedAnswer = answer;
        
        // Remove spaces, punctuation
        normalizedAnswer = normalizedAnswer.replace(/[\s,.?!]/g, '');
        
        // Check against romaji
        const romajiOptions = question.romaji.toLowerCase().split(', ').map(s => s.trim());
        
        // Also check against Japanese readings (hiragana/katakana)
        const japaneseReadings = question.reading.map(r => r.trim());
        
        // Check exact match or partial match
        return romajiOptions.some(opt => {
            // Split compound romaji answers (like "ichi, hitotsu")
            const opts = opt.split(/[ ,\/]/);
            return opts.some(o => o && (
                normalizedAnswer.includes(o) || 
                o.includes(normalizedAnswer)
            ));
        }) || japaneseReadings.some(r => {
            const readings = r.split(/[ ,\/]/);
            return readings.some(read => read && (
                normalizedAnswer.includes(read) ||
                read.includes(normalizedAnswer)
            ));
        });
    }
    
    showFeedback(isCorrect, question) {
        this.ui.feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        
        if (isCorrect) {
            this.ui.feedbackText.textContent = '✓ Correct! ' + question.char + ' = ' + question.romaji;
        } else {
            this.ui.feedbackText.innerHTML = '✗ Incorrect. ' + question.char + ' = ' + question.romaji;
        }
        
        this.ui.feedback.style.display = 'block';
    }
    
    nextQuestion() {
        this.currentIndex++;
        this.showQuestion();
    }
    
    skipQuestion() {
        this.streak = 0;
        this.totalAnswered++;
        this.nextQuestion();
    }
    
    resetQuiz() {
        alert(`Quiz Complete! Final Score: ${this.score}/${this.totalAnswered}`);
        this.shuffleArray(this.questionList);
        this.currentIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.totalAnswered = 0;
        this.updateUI();
        this.showQuestion();
    }
    
    updateUI() {
        this.ui.scoreDisplay.textContent = this.score;
        this.ui.totalDisplay.textContent = this.totalAnswered;
        this.ui.streakDisplay.textContent = this.streak;
    }
    
    updateProgress() {
        const progress = ((this.currentIndex) / this.questionList.length) * 100;
        this.ui.progressFill.style.width = `${progress}%`;
    }
    
    updateModeInfo() {
        const info = {
            hiragana: 'ひらがな - Basic Japanese syllabary. Essential for grammar particles and native words.',
            katakana: 'カタカナ - Used primarily for foreign loanwords and emphasis.',
            kanji: '漢字 - Logographic characters borrowed from Chinese. Each has multiple readings.'
        };
        this.ui.modeInfo.textContent = info[this.currentMode];
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JapaneseQuiz();
});