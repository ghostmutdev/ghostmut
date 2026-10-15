// app.js - Updated with audio, stats, and localStorage
class JapaneseQuiz {
    constructor() {
        this.currentMode = 'hiragana';
        this.currentSection = 'section1';
        this.questionList = [];
        this.currentIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.totalAnswered = 0;
        this.currentCharacter = null;
        
        // Stats tracking
        this.stats = this.loadStats();
        
        this.ui = {
            navBtns: document.querySelectorAll('.nav-btn'),
            studyView: document.getElementById('studyView'),
            quizView: document.getElementById('quizView'),
            sectionSelector: document.querySelectorAll('.section-btn'),
            sectionTitle: document.getElementById('sectionTitle'),
            sectionDescription: document.getElementById('sectionDescription'),
            studyGrid: document.getElementById('studyGrid'),
            startQuizBtn: document.getElementById('startQuizBtn'),
            backStudyBtn: document.getElementById('backStudyBtn'),
            characterDisplay: document.getElementById('characterDisplay'),
            audioBtn: document.getElementById('audioBtn'),
            hintDisplay: document.getElementById('hintDisplay'),
            answerInput: document.getElementById('answerInput'),
            feedback: document.getElementById('feedback'),
            feedbackText: document.getElementById('feedbackText'),
            scoreDisplay: document.getElementById('scoreDisplay'),
            totalDisplay: document.getElementById('totalDisplay'),
            streakDisplay: document.getElementById('streakDisplay'),
            progressFill: document.getElementById('progressFill'),
            skipBtn: document.getElementById('skipBtn'),
            modeInfo: document.getElementById('modeInfo'),
            showRomaji: document.getElementById('showRomaji'),
            japaneseInput: document.getElementById('japaneseInput'),
            autoPlayAudio: document.getElementById('autoPlayAudio'),
            statsBtn: document.getElementById('statsBtn'),
            statsModal: document.getElementById('statsModal'),
            closeStats: document.getElementById('closeStats'),
            resetStats: document.getElementById('resetStats')
        };
        
        this.speechSynthesis = window.speechSynthesis;
        this.currentVoice = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadVoice();
        this.showStudyView();
    }
    
    loadStats() {
        const saved = localStorage.getItem('japaneseLearningStats');
        return saved ? JSON.parse(saved) : {
            totalStudied: 0,
            correctAnswers: 0,
            totalAttempts: 0,
            bestStreak: 0,
            wrongCharacters: {},
            startDate: new Date().toISOString(),
            lastActiveDate: new Date().toISOString(),
            progress: {
                hiragana: { studied: new Set(), quizTaken: [] },
                katakana: { studied: new Set(), quizTaken: [] },
                kanji: { studied: new Set(), quizTaken: [] }
            }
        };
    }
    
    saveStats() {
        localStorage.setItem('japaneseLearningStats', JSON.stringify(this.stats));
    }
    
    loadVoice() {
        // Try to find a Japanese voice
        if (this.speechSynthesis) {
            const voices = this.speechSynthesis.getVoices();
            this.currentVoice = voices.find(v => v.lang.startsWith('ja')) || 
                               voices.find(v => v.lang.includes('Japan'));
            
            this.speechSynthesis.onvoiceschanged = () => {
                const voices = this.speechSynthesis.getVoices();
                this.currentVoice = voices.find(v => v.lang.startsWith('ja'));
            };
        }
    }
    
    playAudio(text) {
        if (!this.speechSynthesis) return;
        
        this.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        if (this.currentVoice) {
            utterance.voice = this.currentVoice;
        }
        utterance.lang = 'ja-JP';
        this.speechSynthesis.speak(utterance);
    }
    
    setupEventListeners() {
        // Navigation buttons
        this.ui.navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.switchMode(mode);
            });
        });
        
        // Section buttons
        this.ui.sectionSelector.forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                this.switchSection(section);
            });
        });
        
        // Start quiz button
        this.ui.startQuizBtn.addEventListener('click', () => this.startQuiz());
        
        // Back to study button
        this.ui.backStudyBtn.addEventListener('click', () => this.showStudyView());
        
        // Form submission
        document.getElementById('answerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.checkAnswer();
        });
        
        // Audio button
        this.ui.audioBtn.addEventListener('click', () => {
            if (this.currentCharacter) {
                this.playAudio(this.currentCharacter.char);
            }
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
        this.ui.autoPlayAudio.addEventListener('change', () => {
            if (this.ui.autoPlayAudio.checked && this.currentCharacter) {
                this.playAudio(this.currentCharacter.char);
            }
        });
        
        // Stats modal
        this.ui.statsBtn.addEventListener('click', () => {
            this.ui.statsModal.classList.add('active');
            this.updateStatsDisplay();
        });
        
        this.ui.closeStats.addEventListener('click', () => {
            this.ui.statsModal.classList.remove('active');
        });
        
        this.ui.resetStats.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all progress?')) {
                this.resetAllStats();
            }
        });
        
        // Close modal on outside click
        this.ui.statsModal.addEventListener('click', (e) => {
            if (e.target === this.ui.statsModal) {
                this.ui.statsModal.classList.remove('active');
            }
        });
    }
    
    switchMode(mode) {
        this.currentMode = mode;
        this.currentSection = 'section1';
        
        this.ui.navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        this.ui.sectionSelector.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === 'section1');
        });
        
        this.showStudyView();
        this.updateModeInfo();
    }
    
    switchSection(section) {
        this.currentSection = section;
        
        this.ui.sectionSelector.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === section);
        });
        
        this.updateStudyGrid();
    }
    
    showStudyView() {
        this.ui.studyView.style.display = 'block';
        this.ui.quizView.style.display = 'none';
        this.updateStudyGrid();
    }
    
    updateStudyGrid() {
        const sectionName = {
            'section1': 'Part 1',
            'section2': 'Part 2', 
            'section3': 'Part 3'
        };
        
        const modeTitles = {
            'hiragana': 'ひらがな',
            'katakana': 'カタカナ',
            'kanji': '漢字'
        };
        
        this.ui.sectionTitle.textContent = `Study ${modeTitles[this.currentMode]} - ${sectionName[this.currentSection]}`;
        this.ui.sectionDescription.textContent = `Learn these ${this.getCurrentSectionChars().length} characters before taking the quiz.`;
        
        const chars = this.getCurrentSectionChars();
        this.ui.studyGrid.innerHTML = chars.map(c => `
            <div class="grid-item" onclick="quiz.playAudio('${c.char}')">
                <div class="char">${c.char}</div>
                <div class="reading">${c.romaji}</div>
            </div>
        `).join('');
    }
    
    getCurrentSectionChars() {
        return japaneseData[this.currentMode][this.currentSection];
    }
    
    startQuiz() {
        this.ui.studyView.style.display = 'none';
        this.ui.quizView.style.display = 'block';
        
        // Clone and shuffle questions
        this.questionList = [...this.getCurrentSectionChars()];
        this.shuffleArray(this.questionList);
        this.currentIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.totalAnswered = 0;
        
        // Mark as studied
        this.questionList.forEach(q => {
            this.stats.progress[this.currentMode].studied.add(q.char);
            if (!this.stats.progress[this.currentMode].quizTaken.includes(this.currentSection)) {
                this.stats.progress[this.currentMode].quizTaken.push(this.currentSection);
            }
        });
        this.saveStats();
        
        this.updateUI();
        this.showQuestion();
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    showQuestion() {
        if (this.currentIndex >= this.questionList.length) {
            alert(`Quiz Complete! Score: ${this.score}/${this.totalAnswered}`);
            this.showStudyView();
            return;
        }
        
        this.currentCharacter = this.questionList[this.currentIndex];
        this.ui.characterDisplay.textContent = this.currentCharacter.char;
        this.updateHint();
        this.ui.answerInput.value = '';
        this.ui.feedback.className = 'feedback';
        this.ui.feedback.style.display = 'none';
        this.ui.answerInput.focus();
        
        // Auto-play audio if enabled
        if (this.ui.autoPlayAudio.checked) {
            this.playAudio(this.currentCharacter.char);
        }
        
        this.updateProgress();
    }
    
    updateHint() {
        if (!this.currentCharacter) return;
        
        const showRomaji = this.ui.showRomaji.checked;
        this.ui.hintDisplay.textContent = showRomaji ? 
            `Reading: ${this.currentCharacter.romaji}` : '';
    }
    
    checkAnswer() {
        const answer = this.ui.answerInput.value.trim().toLowerCase();
        if (!answer) return;
        
        const isValid = this.validateAnswer(answer, this.currentCharacter);
        
        this.totalAnswered++;
        this.stats.totalAttempts++;
        this.stats.totalStudied++;
        
        if (isValid) {
            this.score++;
            this.stats.correctAnswers++;
            this.streak++;
            if (this.streak > this.bestStreak) {
                this.bestStreak = this.streak;
                this.stats.bestStreak = this.bestStreak;
            }
            // Remove from wrong characters if it was there
            if (this.stats.wrongCharacters[this.currentCharacter.char]) {
                delete this.stats.wrongCharacters[this.currentCharacter.char];
            }
            this.showFeedback(true);
        } else {
            this.streak = 0;
            // Track wrong character
            if (!this.stats.wrongCharacters[this.currentCharacter.char]) {
                this.stats.wrongCharacters[this.currentCharacter.char] = 0;
            }
            this.stats.wrongCharacters[this.currentCharacter.char]++;
            this.showFeedback(false);
        }
        
        this.stats.lastActiveDate = new Date().toISOString();
        this.saveStats();
        this.updateUI();
        
        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
    }
    
    validateAnswer(answer, question) {
        let normalizedAnswer = answer.replace(/[\s,.?!]/g, '');
        
        const romajiOptions = question.romaji.toLowerCase().split(', ').map(s => s.trim());
        const japaneseReadings = question.reading.map(r => r.trim());
        
        return romajiOptions.some(opt => {
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
    
    showFeedback(isCorrect) {
        this.ui.feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        
        if (isCorrect) {
            this.ui.feedbackText.textContent = `✓ Correct! ${this.currentCharacter.char} = ${this.currentCharacter.romaji}`;
        } else {
            this.ui.feedbackText.innerHTML = `✗ Incorrect. ${this.currentCharacter.char} = ${this.currentCharacter.romaji}`;
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
        this.stats.totalAttempts++;
        this.stats.lastActiveDate = new Date().toISOString();
        this.saveStats();
        this.nextQuestion();
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
    
    // Statistics Methods
    updateStatsDisplay() {
        const accuracy = this.stats.totalAttempts > 0 ? 
            Math.round((this.stats.correctAnswers / this.stats.totalAttempts) * 100) : 0;
        
        const daysSinceStart = Math.floor(
            (new Date() - new Date(this.stats.startDate)) / (1000 * 60 * 60 * 24)
        );
        
        document.getElementById('totalStudied').textContent = this.stats.totalStudied;
        document.getElementById('accuracyRate').textContent = `${accuracy}%`;
        document.getElementById('bestStreak').textContent = `${this.stats.bestStreak} 🔥`;
        document.getElementById('daysActive').textContent = Math.max(1, daysSinceStart);
        
        // Weak characters
        const weakList = document.getElementById('weakList');
        const sortedWrong = Object.entries(this.stats.wrongCharacters)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        if (sortedWrong.length === 0) {
            weakList.innerHTML = '<p style="color:#666;">Great job! No weak areas yet.</p>';
        } else {
            weakList.innerHTML = sortedWrong
                .map(([char, count]) => `<span class="weak-tag">${char} (${count}×)</span>`).join('');
        }
        
        // Progress bars
        const modes = ['hiragana', 'katakana', 'kanji'];
        const totalSections = 3;
        
        modes.forEach(mode => {
            const mastered = this.stats.progress[mode].studied.size;
            const total = Object.keys(japaneseData[mode]).length * 
                         Object.values(japaneseData[mode])[0].length;
            const percent = Math.round((mastered / total) * 100);
            
            const elementId = `${mode}Progress`;
            const percentId = `${mode}Percent`;
            
            document.getElementById(elementId).style.width = `${percent}%`;
            document.getElementById(percentId).textContent = `${percent}%`;
        });
    }
    
    resetAllStats() {
        localStorage.removeItem('japaneseLearningStats');
        this.stats = this.loadStats();
        this.ui.statsModal.classList.remove('active');
        alert('Progress has been reset. Good luck studying!');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quiz = new JapaneseQuiz();
});