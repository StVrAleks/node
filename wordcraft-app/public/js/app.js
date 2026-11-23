const App = {
    totalScore: parseInt(localStorage.getItem('wordcraft_score') || '0', 10),
    currentList: null,
    currentWords: [],
    
    // Состояние текущей игровой сессии
    sessionQueue: [],
    totalQuestions: 0,
    correctFirstTry: 0,
    sessionPoints: 0,
    retriedIds: new Set(),
    timerInterval: null,
    playerName: localStorage.getItem('wordcraft_player') || '',

    isGameActive: false,
    isPaused: false,
    remainingTicks: 0,
    totalTicks: 0,
    onTimeoutCallback: null,

    init() {
        this.updateScoreUI();
        this.updateMuteUI();
        this.loadLists();

        // Обработка формы добавления нового слова
        document.getElementById('add-word-form').onsubmit = (e) => {
            e.preventDefault();
            this.addWord();
        };
          document.addEventListener('keydown', (e) => {
            if (!this.isGameActive) return;
            if (e.key === 'Escape') {
                this.togglePause();
            } else if (e.code === 'Space' && this.isPaused) {
                e.preventDefault();
                this.togglePause();
            }
        });
    },

    // Навигация между экранами
  showScreen(screenName) {
        // Если уходим с игрового экрана — принудительно убиваем игру и таймер
        if (screenName !== 'game') {
            this.isGameActive = false;
            this.isPaused = false;
            this.stopTimer();
        }
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`screen-${screenName}`).classList.add('active');
        if (screenName === 'home') this.loadLists();
    },

      // Выход из игры с подтверждением
    exitGame() {
        const wasPaused = this.isPaused;
        if (!wasPaused) this.togglePause(); // Ставим на паузу на время окна confirm

        if (confirm('Прервать текущую тренировку?')) {
            this.isGameActive = false;
            this.isPaused = false;
            this.stopTimer();
            this.showScreen('words');
        } else if (!wasPaused) {
            this.togglePause(); // Если нажали "Отмена" — снимаем с паузы
        }
    },

    // Пауза / Продолжение
    togglePause() {
        if (!this.isGameActive) return;

        this.isPaused = !this.isPaused;
        const pauseOverlay = document.getElementById('pause-overlay');
        const gameArea = document.getElementById('game-area');
        const pauseBtn = document.getElementById('pause-btn');

        if (this.isPaused) {
            this.stopTimer();
            pauseOverlay.style.display = 'block';
            gameArea.style.display = 'none';
            pauseBtn.textContent = '▶ Продолжить';
        } else {
            pauseOverlay.style.display = 'none';
            gameArea.style.display = 'flex';
            pauseBtn.textContent = '⏸ Пауза';
            this.resumeTimer();
        }
    },

    // Звук и баллы
    toggleMute() {
        Feedback.isMuted = !Feedback.isMuted;
        localStorage.setItem('wordcraft_muted', Feedback.isMuted);
        this.updateMuteUI();
        if (!Feedback.isMuted) Feedback.tap();
    },

    updateMuteUI() {
        document.getElementById('mute-btn').textContent = Feedback.isMuted ? '🔇' : '🔊';
    },

    updateScoreUI() {
        document.getElementById('total-score').textContent = this.totalScore;
    },

    addPoints(pts) {
        this.totalScore += pts;
        this.sessionPoints += pts;
        localStorage.setItem('wordcraft_score', this.totalScore);
        this.updateScoreUI();
        document.getElementById('session-score').textContent = this.sessionPoints;
    },

    // --- РАБОТА СО СПИСКАМИ ---
    async loadLists() {
        const res = await fetch('/api/lists');
        const lists = await res.json();
        const container = document.getElementById('lists-container');
        container.innerHTML = '';

        if (lists.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#6b7280; margin-top:20px;">Пока нет ни одного списка. Нажмите «+ Список», чтобы создать первый!</p>';
            return;
        }

        lists.forEach(list => {
            const count = list.Words ? list.Words.length : 0;
            const card = document.createElement('div');
            card.className = 'list-card';
            card.innerHTML = `
                <div class="list-info">
                    <h3>${list.title}</h3>
                    <span>Слов в списке: ${count}</span>
                </div>
                <div class="lang-badge">${list.language === 'ru' ? '🇷🇺' : '🇬🇧'}</div>
            `;
            card.onclick = () => this.openList(list);
            container.appendChild(card);
        });
    },

    openNewListModal() {
        document.getElementById('new-list-title').value = '';
        document.getElementById('modal-new-list').classList.add('open');
    },

    closeModal() {
        document.getElementById('modal-new-list').classList.remove('open');
    },

    async createList() {
        const title = document.getElementById('new-list-title').value.trim();
        const language = document.getElementById('new-list-lang').value;
        if (!title) return;

        await fetch('/api/lists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, language })
        });

        Feedback.tap();
        this.closeModal();
        this.loadLists();
    },

    async deleteCurrentList() {
        if (!this.currentList || !confirm(`Удалить список «${this.currentList.title}» и все его слова?`)) return;
        await fetch(`/api/lists/${this.currentList.id}`, { method: 'DELETE' });
        this.showScreen('home');
    },

    // --- РАБОТА СО СЛОВАМИ ---
    async openList(list) {
        this.currentList = list;
        document.getElementById('current-list-title').textContent = list.title;
        
        // Показываем нужные поля формы в зависимости от языка
        const isEn = list.language === 'en';
        document.getElementById('input-translation').style.display = isEn ? 'block' : 'none';
        document.getElementById('input-translation').required = isEn;
        document.getElementById('input-wrong').style.display = isEn ? 'none' : 'block';
        document.getElementById('input-word').placeholder = isEn ? 'Английское слово (apple)' : 'Словарное слово (винегрет)';

        this.showScreen('words');
        await this.loadWords();
    },

    async loadWords() {
        const res = await fetch(`/api/words/list/${this.currentList.id}`);
        this.currentWords = await res.json();
        const container = document.getElementById('words-container');
        container.innerHTML = '';

        const startBtn = document.getElementById('start-game-btn');
        startBtn.disabled = this.currentWords.length === 0;
        startBtn.style.opacity = this.currentWords.length === 0 ? '0.5' : '1';

        this.currentWords.forEach(w => {
            const item = document.createElement('div');
            item.className = 'word-item';
            item.innerHTML = `
                <div>
                    <strong>${w.word}</strong>
                    ${w.translation ? `<small>${w.translation}</small>` : ''}
                </div>
                <button class="btn-del-word" onclick="App.deleteWord(${w.id})">✕</button>
            `;
            container.appendChild(item);
        });
    },

    async addWord() {
        const word = document.getElementById('input-word').value;
        const translation = document.getElementById('input-translation').value;
        const maskedWord = document.getElementById('input-masked').value;
        const wrongVariant = document.getElementById('input-wrong').value;

        await fetch('/api/words', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                listId: this.currentList.id,
                word,
                translation,
                maskedWord,
                wrongVariant
            })
        });

        Feedback.tap();
        document.getElementById('add-word-form').reset();
        await this.loadWords();
    },

    async deleteWord(wordId) {
        await fetch(`/api/words/${wordId}`, { method: 'DELETE' });
        Feedback.tap();
        await this.loadWords();
    },

lastWordId: null,

    // --- ИГРОВОЙ ПРОЦЕСС ---
 startTraining() {
        if (this.currentWords.length === 0) return;
        Feedback.tap();

        let shuffled = Games.shuffle([...this.currentWords]);

        if (shuffled.length > 1 && shuffled[0].id === this.lastWordId) {
            const first = shuffled.shift();
            shuffled.push(first);
        }

        this.sessionQueue = shuffled;
        this.totalQuestions = this.sessionQueue.length;
        this.correctFirstTry = 0;
        this.sessionPoints = 0;
        this.retriedIds.clear();

        // Включаем активный статус игры (раскомментировано!)
        this.isGameActive = true;
        this.isPaused = false;

        document.getElementById('session-score').textContent = '0';
        const pauseOverlay = document.getElementById('pause-overlay');
        const gameArea = document.getElementById('game-area');
        const pauseBtn = document.getElementById('pause-btn');

        if (pauseOverlay) pauseOverlay.style.display = 'none';
        if (gameArea) gameArea.style.display = 'flex';
        if (pauseBtn) pauseBtn.textContent = '⏸ Пауза';

        this.showScreen('game');
        this.nextQuestion();
    },

    nextQuestion() {
        this.stopTimer();
        if (!this.isGameActive) return;

        if (this.sessionQueue.length === 0) {
            this.isGameActive = false;
            this.finishTraining();
            return;
        }

        const completedCount = this.totalQuestions - this.sessionQueue.length;
        document.getElementById('game-progress').textContent = `${completedCount + 1} / ${this.totalQuestions}`;
        document.getElementById('progress-fill').style.width = `${(completedCount / this.totalQuestions) * 100}%`;

        const currentWord = this.sessionQueue[0];
        const gameArea = document.getElementById('game-area');

        const handleResult = (isCorrect) => {
            if (!this.isGameActive || this.isPaused) return;
            this.stopTimer();

            fetch(`/api/words/${currentWord.id}/stats`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCorrect })
            });

            if (isCorrect) {
                Feedback.success();
                this.lastWordId = currentWord.id;
                const isFirstTry = !this.retriedIds.has(currentWord.id);
                if (isFirstTry) {
                    this.correctFirstTry++;
                    this.addPoints(10);
                } else {
                    this.addPoints(5);
                }
                this.sessionQueue.shift();
            } else {
                Feedback.error();
                this.retriedIds.add(currentWord.id);
                const failedWord = this.sessionQueue.shift();
                this.sessionQueue.push(failedWord);
            }

            this.nextQuestion();
        };

        Games.renderTask(currentWord, this.currentWords, this.currentList.language, gameArea, handleResult);

        const isAnagram = gameArea.querySelector('.letter-pool') !== null;
        const isMatchPairs = gameArea.querySelector('.match-grid') !== null;
        const timeLimit = isMatchPairs ? 20 : (isAnagram ? 15 : 8);
        this.startTimer(timeLimit, () => handleResult(false));
    },

    confirmExitGame() {
        if (confirm('Прервать текущую тренировку?')) {
            this.stopTimer();
            this.showScreen('words');
        }
    },

startTimer(seconds, onTimeout) {
        this.stopTimer();
        this.remainingTicks = seconds * 10;
        this.totalTicks = this.remainingTicks;
        this.onTimeoutCallback = onTimeout;

        const fillEl = document.getElementById('timer-fill');
        const textEl = document.getElementById('timer-text');

        fillEl.style.width = '100%';
        fillEl.classList.remove('danger');
        textEl.classList.remove('danger');
        textEl.textContent = `${seconds}с`;

        this.resumeTimer();
    },

      resumeTimer() {
        this.stopTimer();
        if (!this.isGameActive || this.isPaused) return;

        const fillEl = document.getElementById('timer-fill');
        const textEl = document.getElementById('timer-text');

        this.timerInterval = setInterval(() => {
            if (!this.isGameActive || this.isPaused) {
                this.stopTimer();
                return;
            }

            this.remainingTicks--;
            const percent = (this.remainingTicks / this.totalTicks) * 100;
            fillEl.style.width = `${percent}%`;
            textEl.textContent = `${Math.ceil(this.remainingTicks / 10)}с`;

            if (this.remainingTicks <= 30) {
                fillEl.classList.add('danger');
                textEl.classList.add('danger');
                if (this.remainingTicks % 10 === 0 && this.remainingTicks > 0) {
                    Feedback.playTone(800, 'sine', 0.03);
                }
            }

            if (this.remainingTicks <= 0) {
                this.stopTimer();
                if (this.onTimeoutCallback) this.onTimeoutCallback();
            }
        }, 100);
    },

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },
        // Вызывается в начале App.init()
    initPlayer() {
        this.updatePlayerUI();
        // Если имя еще не введено, мягко просим представиться
        if (!this.playerName) {
            setTimeout(() => this.askPlayerName(), 400);
        }
    },

    updatePlayerUI() {
        document.getElementById('player-name-display').textContent = this.playerName || 'Ввести имя';
    },

    askPlayerName() {
        const name = prompt('Введите ваше имя для сохранения рекордов:', this.playerName);
        if (name && name.trim()) {
            this.playerName = name.trim();
            localStorage.setItem('wordcraft_player', this.playerName);
            this.updatePlayerUI();
            Feedback.tap();
        }
    },

    // Открытие и загрузка таблицы лидеров
    async openLeaderboard() {
        Feedback.tap();
        document.getElementById('modal-leaderboard').classList.add('open');
        const listEl = document.getElementById('leaderboard-list');
        listEl.innerHTML = '<p style="text-align:center; color:#6b7280;">Загрузка...</p>';

        const res = await fetch('/api/scores');
        const leaders = await res.json();
        listEl.innerHTML = '';

        if (leaders.length === 0) {
            listEl.innerHTML = '<p style="text-align:center; color:#6b7280;">Пока рекордов нет. Станьте первым!</p>';
            return;
        }

        leaders.forEach((item, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            const isMe = item.playerName.toLowerCase() === this.playerName.toLowerCase();
            
            const row = document.createElement('div');
            row.className = `leader-row ${isMe ? 'me' : ''}`;
            row.innerHTML = `
                <span>${medal} ${item.playerName}</span>
                <strong>${item.points} ⭐</strong>
            `;
            listEl.appendChild(row);
        });
    },

    closeLeaderboard() {
        document.getElementById('modal-leaderboard').classList.remove('open');
    },

 async finishTraining() {
        Feedback.win();
        const percent = Math.round((this.correctFirstTry / this.totalQuestions) * 100);

        // Если имя еще не указано, спрашиваем перед сохранением рекорда
        if (!this.playerName && this.sessionPoints > 0) {
            this.askPlayerName();
        }

        // Отправляем баллы раунда в MySQL
        if (this.playerName && this.sessionPoints > 0) {
            const scoreRes = await fetch('/api/scores/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerName: this.playerName,
                    points: this.sessionPoints
                })
            });
            const updatedPlayer = await scoreRes.json();
            // Синхронизируем общий счет в шапке с данными из БД
            if (updatedPlayer.points !== undefined) {
                this.totalScore = updatedPlayer.points;
                localStorage.setItem('wordcraft_score', this.totalScore);
                this.updateScoreUI();
            }
        }

        // Загружаем поздравление
        const res = await fetch(`/api/motivations/${percent}`);
        const motivation = await res.json();

        document.getElementById('result-title').textContent = motivation.title;
        document.getElementById('result-message').textContent = motivation.message;
        document.getElementById('result-percent').textContent = `${percent}%`;
        document.getElementById('result-points').textContent = this.sessionPoints;

        this.showScreen('result');
    }
};

// Запуск приложения после загрузки страницы
document.addEventListener('DOMContentLoaded', () => App.init());