(function() {
    'use strict';
    console.log('[APP.JS] Starting...');

    const STORAGE_KEY = 'japaneseLearningStats_v2';
    const MODE_TITLES = { hiragana: 'ひらがな', katakana: 'カタカナ', kanji: '漢字' };
    const SECTION_LABELS = { section1: 'Part 1', section2: 'Part 2', section3: 'Part 3' };
    const MODE_INFO = {
        hiragana: 'Basic syllabary for grammar particles and native words.',
        katakana: 'Used for foreign loanwords and emphasis.',
        kanji: 'Logographic characters with multiple readings.'
    };

    function todayKey() { return new Date().toISOString().slice(0, 10); }
    
    function normalize(val) {
        return String(val || '').toLowerCase()
            .replace(/[\s\u3000]/g, '')
            .replace(/[.'"\-\u30FB]/g, '')
            .replace(/ā/g,'aa').replace(/ī/g,'ii').replace(/ū/g,'uu')
            .replace(/ē/g,'ee').replace(/ō/g,'oo');
    }

    function JapaneseQuiz() {
        this.currentMode = 'hiragana';
        this.currentSection = 'section1';
        this.questionList = [];
        this.currentIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.totalAnswered = 0;
        this.currentCharacter = null;
        this.advanceTimer = null;
        this.stats = this.loadStats();
        this.synth = window.speechSynthesis || null;
        this.jpVoice = null;
        this.toastShown = false;

        this.ui = {
            navBtns: document.querySelectorAll('.nav-btn'),
            sectionBtns: document.querySelectorAll('.section-btn'),
            studyView: document.getElementById('studyView'),
            quizView: document.getElementById('quizView'),
            quizBody: document.getElementById('quizBody'),
            completionPanel: document.getElementById('completionPanel'),
            completionText: document.getElementById('completionText'),
            retryBtn: document.getElementById('retryBtn'),
            completionBackBtn: document.getElementById('completionBackBtn'),
            sectionTitle: document.getElementById('sectionTitle'),
            sectionDescription: document.getElementById('sectionDescription'),
            studyGrid: document.getElementById('studyGrid'),
            startQuizBtn: document.getElementById('startQuizBtn'),
            backStudyBtn: document.getElementById('backStudyBtn'),
            characterDisplay: document.getElementById('characterDisplay'),
            audioBtn: document.getElementById('audioBtn'),
            hintDisplay: document.getElementById('hintDisplay'),
            answerForm: document.getElementById('answerForm'),
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
            autoPlayAudio: document.getElementById('autoPlayAudio'),
            statsBtn: document.getElementById('statsBtn'),
            statsModal: document.getElementById('statsModal'),
            closeStats: document.getElementById('closeStats'),
            resetStats: document.getElementById('resetStats'),
            debugMsg: document.getElementById('debugMsg')
        };

        this.init();
    }

    JapaneseQuiz.prototype.init = function() {
        if (typeof japaneseData === 'undefined') {
            console.error('[ERROR] japaneseData not defined! Check data.js.');
            this.ui.sectionDescription.textContent = 'ERROR: data.js failed to load. Check browser console (F12).';
            this.ui.debugMsg.textContent = 'Missing: japaneseData global variable';
            return;
        }

        console.log('[INIT] japaneseData loaded:', typeof japaneseData);
        console.log('[INIT] Sections available:', Object.keys(japaneseData));
        console.log('[INIT] Hiragana section1 count:', japaneseData.hiragana?.section1?.length || 0);

        this.bindEvents();
        this.loadVoices();
        this.switchMode('hiragana');
    };

    JapaneseQuiz.prototype.bindEvents = function() {
        var self = this;

        Array.prototype.forEach.call(this.ui.navBtns, function(btn) {
            btn.addEventListener('click', function() {
                self.switchMode(btn.getAttribute('data-mode'));
            });
        });

        Array.prototype.forEach.call(this.ui.sectionBtns, function(btn) {
            btn.addEventListener('click', function() {
                self.switchSection(btn.getAttribute('data-section'));
            });
        });

        this.ui.startQuizBtn.addEventListener('click', function() { self.startQuiz(); });
        this.ui.backStudyBtn.addEventListener('click', function() { self.showStudyView(); });
        this.ui.completionBackBtn.addEventListener('click', function() { self.showStudyView(); });
        this.ui.retryBtn.addEventListener('click', function() { self.startQuiz(); });

        this.ui.answerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            self.checkAnswer();
        });

        this.ui.audioBtn.addEventListener('click', function() {
            if (self.currentCharacter) self.playAudio(self.currentCharacter.char);
        });

        this.ui.skipBtn.addEventListener('click', function() { self.skipQuestion(); });
        this.ui.showRomaji.addEventListener('change', function() { self.updateHint(); });
        this.ui.autoPlayAudio.addEventListener('change', function() {
            if (self.ui.autoPlayAudio.checked && self.currentCharacter) {
                self.playAudio(self.currentCharacter.char);
            }
        });

        this.ui.studyGrid.addEventListener('click', function(e) {
            var tile = e.target.closest ? e.target.closest('.grid-item') : e.target;
            if (tile) {
                var char = tile.getAttribute('data-char') || tile.textContent.trim()[0];
                self.playAudio(char);
            }
        });

        this.ui.statsBtn.addEventListener('click', function() {
            self.updateStatsDisplay();
            self.ui.statsModal.classList.add('active');
        });

        this.ui.closeStats.addEventListener('click', function() {
            self.ui.statsModal.classList.remove('active');
        });

        this.ui.statsModal.addEventListener('click', function(e) {
            if (e.target === self.ui.statsModal) {
                self.ui.statsModal.classList.remove('active');
            }
        });

        this.ui.resetStats.addEventListener('click', function() {
            if (window.confirm('Reset all saved progress?')) {
                self.resetAllStats();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                self.ui.statsModal.classList.remove('active');
            }
        });
    };

    JapaneseQuiz.prototype.loadStats = function() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return this.defaultStats();
            var parsed = JSON.parse(raw);
            if (!parsed || !parsed.chars) return this.defaultStats();
            var merged = this.defaultStats();
            merged.totalAttempts = parsed.totalAttempts || 0;
            merged.totalCorrect = parsed.totalCorrect || 0;
            merged.bestStreak = parsed.bestStreak || 0;
            merged.daysSeen = Array.isArray(parsed.daysSeen) ? parsed.daysSeen : [todayKey()];
            ['hiragana','katakana','kanji'].forEach(function(m){ merged.chars[m] = parsed.chars[m] || {}; });
            return merged;
        } catch (err) {
            console.error('[STORAGE] Load error:', err);
            return this.defaultStats();
        }
    };

    JapaneseQuiz.prototype.defaultStats = function() {
        return {
            version: 2,
            totalAttempts: 0,
            totalCorrect: 0,
            bestStreak: 0,
            daysSeen: [todayKey()],
            chars: { hiragana: {}, katakana: {}, kanji: {} }
        };
    };

    JapaneseQuiz.prototype.saveStats = function() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats)); }
        catch (err) { console.error('[STORAGE] Save error:', err); }
    };

    JapaneseQuiz.prototype.touchDay = function() {
        var key = todayKey();
        if (this.stats.daysSeen.indexOf(key) === -1) {
            this.stats.daysSeen.push(key);
        }
    };

    JapaneseQuiz.prototype.charRecord = function(mode, char) {
        var bucket = this.stats.chars[mode] || (this.stats.chars[mode] = {});
        if (!bucket[char]) {
            bucket[char] = { seen: 0, correct: 0, wrong: 0, reviewed: false };
        }
        return bucket[char];
    };

    JapaneseQuiz.prototype.loadVoices = function() {
        var self = this;
        if (!this.synth) {
            console.warn('[AUDIO] No speech synthesis available');
            return;
        }

        var pickVoice = function() {
            var voices = self.synth.getVoices() || [];
            self.jpVoice = voices.find(v => v.lang && v.lang.toLowerCase().indexOf('ja') === 0);
            console.log('[VOICE]', self.jpVoice ? 'Found: ' + self.jpVoice.name : 'Not found');
        };

        pickVoice();
        if (this.synth.addEventListener) {
            this.synth.addEventListener('voiceschanged', pickVoice);
        }
        this.synth.onvoiceschanged = pickVoice;
    };

    JapaneseQuiz.prototype.playAudio = function(text) {
        if (!text || !this.synth) return;
        try {
            this.synth.cancel();
            var utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.85;
            if (this.jpVoice) utterance.voice = this.jpVoice;
            this.synth.speak(utterance);
        } catch (err) {
            console.error('[AUDIO] Play error:', err);
        }
    };

    JapaneseQuiz.prototype.switchMode = function(mode) {
        if (!mode || !japaneseData[mode]) return;
        console.log('[SWITCH] Mode:', mode);
        this.currentMode = mode;
        this.currentSection = 'section1';

        Array.prototype.forEach.call(this.ui.navBtns, function(btn) {
            btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
        });
        Array.prototype.forEach.call(this.ui.sectionBtns, function(btn) {
            btn.classList.toggle('active', btn.getAttribute('data-section') === 'section1');
        });

        this.ui.modeInfo.textContent = MODE_INFO[mode];
        this.showStudyView();
    };

    JapaneseQuiz.prototype.switchSection = function(section) {
        console.log('[SWITCH] Section:', section);
        if (!section) return;
        this.currentSection = section;

        Array.prototype.forEach.call(this.ui.sectionBtns, function(btn) {
            btn.classList.toggle('active', btn.getAttribute('data-section') === section);
        });

        this.updateStudyGrid();
    };

    JapaneseQuiz.prototype.showStudyView = function() {
        window.clearTimeout(this.advanceTimer);
        this.ui.quizView.style.display = 'none';
        this.ui.studyView.style.display = 'block';
        this.ui.quizBody.style.display = 'block';
        this.ui.completionPanel.style.display = 'none';
        this.updateStudyGrid();
    };

    JapaneseQuiz.prototype.updateStudyGrid = function() {
        console.log('[GRID] Updating for:', this.currentMode, this.currentSection);
        var chars = this.getSectionChars();
        var label = SECTION_LABELS[this.currentSection] || 'Part';
        var modeTitle = MODE_TITLES[this.currentMode];

        this.ui.sectionTitle.textContent = 'Study ' + modeTitle + ' — ' + label;
        this.ui.debugMsg.textContent = 'Mode: ' + this.currentMode + ' | Section: ' + this.currentSection + ' | Chars: ' + (chars ? chars.length : 0);

        if (!chars || chars.length === 0) {
            console.error('[GRID] No characters loaded!');
            this.ui.sectionDescription.textContent = 'No characters found. Refresh (Ctrl+Shift+R) or check console.';
            this.ui.studyGrid.innerHTML = '<p style="color:#dc3545;padding:1rem;">Check browser console (F12) for errors.</p>';
            return;
        }

        console.log('[GRID] Rendering', chars.length, 'characters');
        this.ui.sectionDescription.textContent = 
            'Click a character to hear it. Learn these ' + chars.length + ' characters, then take the quiz.';

        var self = this;
        this.ui.studyGrid.innerHTML = chars.map(function(c) {
            var primary = (c.romaji && c.romaji[0]) || (c.readings && c.readings[0]) || '???';
            self.charRecord(self.currentMode, c.char).reviewed = true;
            return '<button type="button" class="grid-item" data-char="' + c.char + '">' +
                   '<div class="char">' + c.char + '</div>' +
                   '<div class="reading">' + primary + '</div>' +
                   '</button>';
        }).join('');

        this.touchDay();
        this.saveStats();
    };

    JapaneseQuiz.prototype.getSectionChars = function() {
        if (!japaneseData || !japaneseData[this.currentMode]) {
            console.error('[GETCHARS] Missing mode data:', this.currentMode);
            return [];
        }
        var section = japaneseData[this.currentMode][this.currentSection];
        if (!Array.isArray(section)) {
            console.error('[GETCHARS] Not an array:', this.currentSection);
            return [];
        }
        return section;
    };

    JapaneseQuiz.prototype.startQuiz = function() {
        var chars = this.getSectionChars();
        if (!chars || chars.length === 0) {
            alert('Nothing to quiz - check data.js is loaded.');
            return;
        }

        console.log('[QUIZ] Starting with', chars.length, 'questions');
        this.ui.studyView.style.display = 'none';
        this.ui.quizView.style.display = 'block';
        this.ui.quizBody.style.display = 'block';
        this.ui.completionPanel.style.display = 'none';

        this.questionList = chars.slice();
        this.shuffleArray(this.questionList);
        this.currentIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.totalAnswered = 0;

        this.updateUI();
        this.showQuestion();
    };

    JapaneseQuiz.prototype.shuffleArray = function(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
        }
    };

    JapaneseQuiz.prototype.showQuestion = function() {
        if (this.currentIndex >= this.questionList.length) {
            this.finishQuiz();
            return;
        }

        this.currentCharacter = this.questionList[this.currentIndex];
        console.log('[QUESTION]', this.currentIndex + 1, ':', this.currentCharacter.char);

        this.ui.characterDisplay.textContent = this.currentCharacter.char;
        this.ui.answerInput.value = '';
        this.ui.feedback.className = 'feedback';
        this.ui.feedbackText.textContent = '';
        this.updateHint();
        this.updateProgress();

        if (this.ui.autoPlayAudio.checked) {
            this.playAudio(this.currentCharacter.char);
        }
        this.ui.answerInput.focus();
    };

    JapaneseQuiz.prototype.updateHint = function() {
        if (!this.currentCharacter) {
            this.ui.hintDisplay.textContent = '';
            return;
        }
        this.ui.hintDisplay.textContent = this.ui.showRomaji.checked ?
            'Reading: ' + (this.currentCharacter.romaji || []).join(', ') : '';
    };

    JapaneseQuiz.prototype.getAllAcceptedAnswers = function(q) {
        var answers = [];
        if (q.romaji) answers = answers.concat(q.romaji);
        if (q.readings) answers = answers.concat(q.readings);
        return answers.map(normalize);
    };

    JapaneseQuiz.prototype.validateAnswer = function(input, q) {
        var guess = normalize(input);
        if (!guess) return false;
        var accepted = this.getAllAcceptedAnswers(q);
        return accepted.indexOf(guess) !== -1;
    };

    JapaneseQuiz.prototype.checkAnswer = function() {
        var raw = this.ui.answerInput.value;
        if (!raw.trim()) return;

        var q = this.currentCharacter;
        var isCorrect = this.validateAnswer(raw, q);
        var record = this.charRecord(this.currentMode, q.char);

        record.seen += 1;
        this.stats.totalAttempts += 1;
        this.totalAnswered += 1;

        if (isCorrect) {
            record.correct += 1;
            this.stats.totalCorrect += 1;
            this.score += 1;
            this.streak += 1;
            if (this.streak > this.stats.bestStreak) {
                this.stats.bestStreak = this.streak;
            }
        } else {
            record.wrong += 1;
            this.streak = 0;
        }

        this.touchDay();
        this.saveStats();
        this.updateUI();
        this.showFeedback(isCorrect, q);

        var self = this;
        window.clearTimeout(this.advanceTimer);
        this.advanceTimer = window.setTimeout(function() {
            self.currentIndex += 1;
            self.showQuestion();
        }, isCorrect ? 900 : 2200);
    };

    JapaneseQuiz.prototype.showFeedback = function(correct, q) {
        var answer = (q.romaji || []).join(', ') || (q.readings || []).join(', ');
        this.ui.feedback.className = 'feedback ' + (correct ? 'correct' : 'incorrect');
        this.ui.feedbackText.textContent = (correct ? '✓ Correct! ' : '✗ Incorrect. ') + q.char + ' = ' + answer;
    };

    JapaneseQuiz.prototype.skipQuestion = function() {
        this.streak = 0;
        this.currentIndex += 1;
        this.showQuestion();
    };

    JapaneseQuiz.prototype.finishQuiz = function() {
        var pct = this.totalAnswered ? Math.round((this.score / this.totalAnswered) * 100) : 0;
        this.ui.quizBody.style.display = 'none';
        this.ui.completionPanel.style.display = 'block';
        this.ui.completionText.textContent = 
            'You scored ' + this.score + '/' + this.totalAnswered + ' (' + pct + '%) on ' +
            MODE_TITLES[this.currentMode] + ' ' + SECTION_LABELS[this.currentSection] + '.';
    };

    JapaneseQuiz.prototype.updateUI = function() {
        this.ui.scoreDisplay.textContent = this.score;
        this.ui.totalDisplay.textContent = this.totalAnswered;
        this.ui.streakDisplay.textContent = this.streak;
    };

    JapaneseQuiz.prototype.updateProgress = function() {
        var pct = this.questionList.length ? (this.currentIndex / this.questionList.length) * 100 : 0;
        this.ui.progressFill.style.width = pct + '%';
    };

    JapaneseQuiz.prototype.updateStatsDisplay = function() {
        var stats = this.stats;
        var reviewed = 0;

        ['hiragana','katakana','kanji'].forEach(function(mode) {
            var bucket = stats.chars[mode] || {};
            Object.keys(bucket).forEach(function(ch) {
                if (bucket[ch].reviewed || bucket[ch].seen > 0) reviewed += 1;
            });
        });

        var accuracy = stats.totalAttempts ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100) : 0;

        document.getElementById('totalStudied').textContent = reviewed;
        document.getElementById('accuracyRate').textContent = accuracy + '%';
        document.getElementById('bestStreak').textContent = stats.bestStreak + ' 🔥';
        document.getElementById('daysActive').textContent = Math.max(1, stats.daysSeen.length);

        // Weak characters
        var weak = [];
        ['hiragana','katakana','kanji'].forEach(function(mode) {
            var bucket = stats.chars[mode] || {};
            Object.keys(bucket).forEach(function(ch) {
                if (bucket[ch].wrong > 0) {
                    weak.push({ char: ch, wrong: bucket[ch].wrong });
                }
            });
        });
        weak.sort(function(a, b) { return b.wrong - a.wrong; });

        var weakList = document.getElementById('weakList');
        if (weak.length === 0) {
            weakList.innerHTML = '<p style="color:#666;">No mistakes recorded!</p>';
        } else {
            weakList.innerHTML = weak.slice(0, 12).map(function(w) {
                return '<span class="weak-tag">' + w.char + ' (' + w.wrong + '×)</span>';
            }).join('');
        }

        // Progress bars
        var self = this;
        ['hiragana','katakana','kanji'].forEach(function(mode) {
            var bucket = stats.chars[mode] || {};
            var seen = Object.keys(bucket).filter(function(ch) {
                return bucket[ch].reviewed || bucket[ch].seen > 0;
            }).length;
            var total = self.countTotalChars(mode);
            var pct = total ? Math.round((seen / total) * 100) : 0;

            var bar = document.getElementById(mode + 'Progress');
            var label = document.getElementById(mode + 'Percent');
            if (bar) bar.style.width = pct + '%';
            if (label) label.textContent = pct + '%';
        });
    };

    JapaneseQuiz.prototype.countTotalChars = function(mode) {
        if (!japaneseData || !japaneseData[mode]) return 0;
        var sections = japaneseData[mode];
        return Object.keys(sections).reduce(function(sum, key) {
            return sum + (sections[key] ? sections[key].length : 0);
        }, 0);
    };

    JapaneseQuiz.prototype.resetAllStats = function() {
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        this.stats = this.defaultStats();
        this.updateStatsDisplay();
        this.ui.statsModal.classList.remove('active');
        alert('Progress reset!');
    };

    document.addEventListener('DOMContentLoaded', function() {
        console.log('[INIT] DOM ready');
        window.quiz = new JapaneseQuiz();
        console.log('[INIT] Quiz instance created');
    });
})();
