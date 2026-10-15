/* Japanese Character Learning — quiz logic, audio, stats, local storage */
(function () {
    'use strict';

    var STORAGE_KEY = 'japaneseLearningStats_v2';

    var MODE_TITLES = { hiragana: 'ひらがな', katakana: 'カタカナ', kanji: '漢字' };
    var SECTION_LABELS = { section1: 'Part 1', section2: 'Part 2', section3: 'Part 3' };
    var MODE_INFO = {
        hiragana: 'ひらがな — the basic syllabary, used for grammatical endings and native words.',
        katakana: 'カタカナ — used mainly for loanwords, foreign names, and emphasis.',
        kanji: '漢字 — logographic characters with several possible readings. Any listed reading is accepted.'
    };

    function todayKey() {
        return new Date().toISOString().slice(0, 10);
    }

    /* Lowercase, strip spaces/punctuation, expand macrons so "jū" == "juu" */
    function normalize(value) {
        return String(value)
            .toLowerCase()
            .replace(/[\s\u3000]/g, '')
            .replace(/[.'’\-·・、。！？]/g, '')
            .replace(/ā/g, 'aa')
            .replace(/ī/g, 'ii')
            .replace(/ū/g, 'uu')
            .replace(/ē/g, 'ee')
            .replace(/ō/g, 'oo');
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
            toast: document.getElementById('toast')
        };

        this.synth = window.speechSynthesis || null;
        this.jpVoice = null;
        this.toastShown = false;

        this.init();
    }

    /* ---------- storage ---------- */

    JapaneseQuiz.prototype.defaultStats = function () {
        return {
            version: 2,
            totalAttempts: 0,
            totalCorrect: 0,
            bestStreak: 0,
            daysSeen: [todayKey()],
            chars: { hiragana: {}, katakana: {}, kanji: {} }
        };
    };

    JapaneseQuiz.prototype.loadStats = function () {
        var fresh = this.defaultStats();
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return fresh;
            var parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object' || !parsed.chars) return fresh;
            // merge onto a fresh object so missing keys can never crash us
            var merged = fresh;
            merged.totalAttempts = parsed.totalAttempts || 0;
            merged.totalCorrect = parsed.totalCorrect || 0;
            merged.bestStreak = parsed.bestStreak || 0;
            merged.daysSeen = Array.isArray(parsed.daysSeen) && parsed.daysSeen.length
                ? parsed.daysSeen : [todayKey()];
            ['hiragana', 'katakana', 'kanji'].forEach(function (mode) {
                merged.chars[mode] = (parsed.chars && parsed.chars[mode]) || {};
            });
            return merged;
        } catch (err) {
            return fresh;
        }
    };

    JapaneseQuiz.prototype.saveStats = function () {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats));
        } catch (err) {
            /* storage full or blocked — the app keeps working in-memory */
        }
    };

    JapaneseQuiz.prototype.touchDay = function () {
        var key = todayKey();
        if (this.stats.daysSeen.indexOf(key) === -1) {
            this.stats.daysSeen.push(key);
        }
    };

    JapaneseQuiz.prototype.charRecord = function (mode, char) {
        var bucket = this.stats.chars[mode] || (this.stats.chars[mode] = {});
        if (!bucket[char]) {
            bucket[char] = { seen: 0, correct: 0, wrong: 0, reviewed: false };
        }
        return bucket[char];
    };

    /* ---------- init ---------- */

    JapaneseQuiz.prototype.init = function () {
        this.bindEvents();
        this.loadVoices();
        this.switchMode('hiragana');
    };

    JapaneseQuiz.prototype.bindEvents = function () {
        var self = this;

        Array.prototype.forEach.call(this.ui.navBtns, function (btn) {
            btn.addEventListener('click', function () {
                self.switchMode(btn.getAttribute('data-mode'));
            });
        });

        Array.prototype.forEach.call(this.ui.sectionBtns, function (btn) {
            btn.addEventListener('click', function () {
                self.switchSection(btn.getAttribute('data-section'));
            });
        });

        this.ui.startQuizBtn.addEventListener('click', function () { self.startQuiz(); });
        this.ui.backStudyBtn.addEventListener('click', function () { self.showStudyView(); });
        this.ui.completionBackBtn.addEventListener('click', function () { self.showStudyView(); });
        this.ui.retryBtn.addEventListener('click', function () { self.startQuiz(); });

        this.ui.answerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            self.checkAnswer();
        });

        this.ui.audioBtn.addEventListener('click', function () {
            if (self.currentCharacter) self.playAudio(self.currentCharacter.char);
        });

        this.ui.skipBtn.addEventListener('click', function () { self.skipQuestion(); });

        this.ui.showRomaji.addEventListener('change', function () { self.updateHint(); });

        this.ui.autoPlayAudio.addEventListener('change', function () {
            if (self.ui.autoPlayAudio.checked && self.currentCharacter) {
                self.playAudio(self.currentCharacter.char);
            }
        });

        /* delegated click on study tiles (no inline handlers, so no global lookups) */
        this.ui.studyGrid.addEventListener('click', function (e) {
            var tile = e.target.closest ? e.target.closest('.grid-item') : null;
            if (tile) self.playAudio(tile.getAttribute('data-char'));
        });

        this.ui.statsBtn.addEventListener('click', function () {
            self.updateStatsDisplay();
            self.ui.statsModal.classList.add('active');
        });
        this.ui.closeStats.addEventListener('click', function () {
            self.ui.statsModal.classList.remove('active');
        });
        this.ui.statsModal.addEventListener('click', function (e) {
            if (e.target === self.ui.statsModal) self.ui.statsModal.classList.remove('active');
        });
        this.ui.resetStats.addEventListener('click', function () {
            if (window.confirm('Reset all saved progress?')) self.resetAllStats();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') self.ui.statsModal.classList.remove('active');
        });
    };

    /* ---------- audio ---------- */

    JapaneseQuiz.prototype.loadVoices = function () {
        var self = this;
        if (!this.synth) return;

        var pick = function () {
            var voices = self.synth.getVoices() || [];
            self.jpVoice = voices.filter(function (v) {
                return v.lang && v.lang.toLowerCase().indexOf('ja') === 0;
            })[0] || null;
        };

        pick();
        if (typeof this.synth.addEventListener === 'function') {
            this.synth.addEventListener('voiceschanged', pick);
        }
        this.synth.onvoiceschanged = pick;
    };

    JapaneseQuiz.prototype.playAudio = function (text) {
        if (!text) return;
        if (!this.synth) {
            this.toast('This browser has no speech support.');
            return;
        }
        this.synth.cancel();
        var utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.85;
        if (this.jpVoice) utterance.voice = this.jpVoice;
        this.synth.speak(utterance);

        if (!this.jpVoice && !this.toastShown) {
            this.toastShown = true;
            this.toast('No Japanese voice found — install one in your OS settings for accurate audio.');
        }
    };

    JapaneseQuiz.prototype.toast = function (message) {
        var el = this.ui.toast;
        if (!el) return;
        el.textContent = message;
        el.classList.add('visible');
        window.clearTimeout(this._toastTimer);
        this._toastTimer = window.setTimeout(function () {
            el.classList.remove('visible');
        }, 4000);
    };

    /* ---------- data access (defensive) ---------- */

    JapaneseQuiz.prototype.getCurrentSectionChars = function () {
        var modeData = (typeof japaneseData !== 'undefined' && japaneseData)
            ? japaneseData[this.currentMode] : null;
        if (!modeData) {
            console.warn('Missing data for mode:', this.currentMode);
            return [];
        }
        var section = modeData[this.currentSection];
        if (!Array.isArray(section)) {
            console.warn('Missing data for section:', this.currentMode, this.currentSection);
            return [];
        }
        return section;
    };

    JapaneseQuiz.prototype.countModeChars = function (mode) {
        var modeData = (typeof japaneseData !== 'undefined' && japaneseData)
            ? japaneseData[mode] : null;
        if (!modeData) return 0;
        return Object.keys(modeData).reduce(function (sum, key) {
            return sum + (Array.isArray(modeData[key]) ? modeData[key].length : 0);
        }, 0);
    };

    /* ---------- views ---------- */

    JapaneseQuiz.prototype.switchMode = function (mode) {
        if (!mode) return;
        this.currentMode = mode;
        this.currentSection = 'section1';

        Array.prototype.forEach.call(this.ui.navBtns, function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
        });
        Array.prototype.forEach.call(this.ui.sectionBtns, function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-section') === 'section1');
        });

        this.ui.modeInfo.textContent = MODE_INFO[mode] || '';
        this.showStudyView();
    };

    JapaneseQuiz.prototype.switchSection = function (section) {
        if (!section) return;
        this.currentSection = section;

        Array.prototype.forEach.call(this.ui.sectionBtns, function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-section') === section);
        });

        this.updateStudyGrid();
    };

    JapaneseQuiz.prototype.showStudyView = function () {
        window.clearTimeout(this.advanceTimer);
        this.ui.quizView.style.display = 'none';
        this.ui.studyView.style.display = 'block';
        this.ui.quizBody.style.display = 'block';
        this.ui.completionPanel.style.display = 'none';
        this.updateStudyGrid();
    };

    JapaneseQuiz.prototype.updateStudyGrid = function () {
        var chars = this.getCurrentSectionChars();
        var label = SECTION_LABELS[this.currentSection] || 'Study';
        var modeTitle = MODE_TITLES[this.currentMode] || '';

        this.ui.sectionTitle.textContent = 'Study ' + modeTitle + ' — ' + label;

        if (!chars.length) {
            this.ui.sectionDescription.textContent =
                'No characters loaded for this section. Make sure data.js was updated too, then hard-refresh.';
            this.ui.studyGrid.innerHTML = '';
            return;
        }

        this.ui.sectionDescription.textContent =
            'Tap a character to hear it. Learn these ' + chars.length +
            ' characters, then take the quiz.';

        var self = this;
        this.ui.studyGrid.innerHTML = chars.map(function (c) {
            var primary = (c.romaji && c.romaji[0]) || (c.readings && c.readings[0]) || '';
            self.charRecord(self.currentMode, c.char).reviewed = true;
            return '<button type="button" class="grid-item" data-char="' + c.char + '">' +
                   '<span class="char">' + c.char + '</span>' +
                   '<span class="reading">' + primary + '</span>' +
                   '</button>';
        }).join('');

        this.touchDay();
        this.saveStats();
    };

    /* ---------- quiz ---------- */

    JapaneseQuiz.prototype.startQuiz = function () {
        var chars = this.getCurrentSectionChars();
        if (!chars.length) {
            this.toast('Nothing to quiz — this section has no characters.');
            return;
        }

        this.ui.studyView.style.display = 'none';
        this.ui.quizView.style.display = 'block';
        this.ui.quizBody.style.display = 'block';
        this.ui.completionPanel.style.display = 'none';

        this.questionList = chars.slice();
        this.shuffle(this.questionList);
        this.currentIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.totalAnswered = 0;

        this.updateUI();
        this.showQuestion();
    };

    JapaneseQuiz.prototype.shuffle = function (arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
        }
    };

    JapaneseQuiz.prototype.showQuestion = function () {
        if (this.currentIndex >= this.questionList.length) {
            this.finishQuiz();
            return;
        }

        this.currentCharacter = this.questionList[this.currentIndex];
        this.ui.characterDisplay.textContent = this.currentCharacter.char;
        this.ui.answerInput.value = '';
        this.ui.feedback.className = 'feedback';
        this.ui.feedbackText.textContent = '';
        this.updateHint();
        this.updateProgress();

        if (this.ui.autoPlayAudio.checked) this.playAudio(this.currentCharacter.char);
        this.ui.answerInput.focus();
    };

    JapaneseQuiz.prototype.updateHint = function () {
        if (!this.currentCharacter) { this.ui.hintDisplay.textContent = ''; return; }
        this.ui.hintDisplay.textContent = this.ui.showRomaji.checked
            ? 'Reading: ' + (this.currentCharacter.romaji || []).join(', ')
            : '';
    };

    JapaneseQuiz.prototype.acceptedAnswers = function (q) {
        return [].concat(q.romaji || [], q.readings || []).map(normalize);
    };

    JapaneseQuiz.prototype.validateAnswer = function (input, q) {
        var guess = normalize(input);
        if (!guess) return false;
        return this.acceptedAnswers(q).indexOf(guess) !== -1;
    };

    JapaneseQuiz.prototype.checkAnswer = function () {
        var raw = this.ui.answerInput.value;
        if (!raw.trim()) return;

        var q = this.currentCharacter;
        var correct = this.validateAnswer(raw, q);
        var record = this.charRecord(this.currentMode, q.char);

        record.seen += 1;
        this.stats.totalAttempts += 1;
        this.totalAnswered += 1;

        if (correct) {
            record.correct += 1;
            this.stats.totalCorrect += 1;
            this.score += 1;
            this.streak += 1;
            if (this.streak > this.stats.bestStreak) this.stats.bestStreak = this.streak;
        } else {
            record.wrong += 1;
            this.streak = 0;
        }

        this.touchDay();
        this.saveStats();
        this.updateUI();
        this.showFeedback(correct, q);

        var self = this;
        window.clearTimeout(this.advanceTimer);
        this.advanceTimer = window.setTimeout(function () {
            self.currentIndex += 1;
            self.showQuestion();
        }, correct ? 900 : 2200);
    };

    JapaneseQuiz.prototype.showFeedback = function (correct, q) {
        var answerText = (q.romaji || []).join(', ');
        if (q.readings && q.readings.length) {
            answerText += ' (' + q.readings.join(', ') + ')';
        }
        this.ui.feedback.className = 'feedback ' + (correct ? 'correct' : 'incorrect');
        this.ui.feedbackText.textContent = (correct ? '✓ Correct! ' : '✗ Not quite. ') +
            q.char + ' = ' + answerText;
    };

    JapaneseQuiz.prototype.skipQuestion = function () {
        this.streak = 0;
        this.currentIndex += 1;
        this.showQuestion();
    };

    JapaneseQuiz.prototype.finishQuiz = function () {
        var pct = this.totalAnswered
            ? Math.round((this.score / this.totalAnswered) * 100) : 0;
        this.ui.quizBody.style.display = 'none';
        this.ui.completionPanel.style.display = 'block';
        this.ui.completionText.textContent =
            'You scored ' + this.score + ' / ' + this.totalAnswered + ' (' + pct + '%) on ' +
            (MODE_TITLES[this.currentMode] || '') + ' ' +
            (SECTION_LABELS[this.currentSection] || '') + '.';
    };

    JapaneseQuiz.prototype.updateUI = function () {
        this.ui.scoreDisplay.textContent = this.score;
        this.ui.totalDisplay.textContent = this.totalAnswered;
        this.ui.streakDisplay.textContent = this.streak;
    };

    JapaneseQuiz.prototype.updateProgress = function () {
        var pct = this.questionList.length
            ? (this.currentIndex / this.questionList.length) * 100 : 0;
        this.ui.progressFill.style.width = pct + '%';
    };

    /* ---------- statistics ---------- */

    JapaneseQuiz.prototype.updateStatsDisplay = function () {
        var stats = this.stats;
        var reviewed = 0;

        ['hiragana', 'katakana', 'kanji'].forEach(function (mode) {
            var bucket = stats.chars[mode] || {};
            Object.keys(bucket).forEach(function (ch) {
                if (bucket[ch].reviewed || bucket[ch].seen > 0) reviewed += 1;
            });
        });

        var accuracy = stats.totalAttempts
            ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100) : 0;

        document.getElementById('totalStudied').textContent = reviewed;
        document.getElementById('accuracyRate').textContent = accuracy + '%';
        document.getElementById('bestStreak').textContent = stats.bestStreak + ' 🔥';
        document.getElementById('daysActive').textContent = Math.max(1, stats.daysSeen.length);

        /* weakest characters */
        var weak = [];
        ['hiragana', 'katakana', 'kanji'].forEach(function (mode) {
            var bucket = stats.chars[mode] || {};
            Object.keys(bucket).forEach(function (ch) {
                if (bucket[ch].wrong > 0) {
                    weak.push({ char: ch, wrong: bucket[ch].wrong });
                }
            });
        });
        weak.sort(function (a, b) { return b.wrong - a.wrong; });

        var weakList = document.getElementById('weakList');
        if (!weak.length) {
            weakList.innerHTML = '<p class="empty-note">No mistakes recorded yet — nice work!</p>';
        } else {
            weakList.innerHTML = weak.slice(0, 12).map(function (w) {
                return '<span class="weak-tag">' + w.char + ' (' + w.wrong + '×)</span>';
            }).join('');
        }

        /* coverage bars */
        var self = this;
        ['hiragana', 'katakana', 'kanji'].forEach(function (mode) {
            var bucket = stats.chars[mode] || {};
            var seen = Object.keys(bucket).filter(function (ch) {
                return bucket[ch].reviewed || bucket[ch].seen > 0;
            }).length;
            var total = self.countModeChars(mode);
            var pct = total ? Math.round((seen / total) * 100) : 0;

            var bar = document.getElementById(mode + 'Progress');
            var label = document.getElementById(mode + 'Percent');
            if (bar) bar.style.width = pct + '%';
            if (label) label.textContent = pct + '%';
        });
    };

    JapaneseQuiz.prototype.resetAllStats = function () {
        try { localStorage.removeItem(STORAGE_KEY); } catch (err) { /* ignore */ }
        this.stats = this.defaultStats();
        this.updateStatsDisplay();
        this.toast('Progress reset.');
    };

    document.addEventListener('DOMContentLoaded', function () {
        window.quiz = new JapaneseQuiz();
    });
})();