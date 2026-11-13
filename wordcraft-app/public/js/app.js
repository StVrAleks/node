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

    init() {
        this.updateScoreUI();
        this.updateMuteUI();
        this.loadLists();

        // Обработка формы добавления нового слова
        document.getElementById('add-word-form').onsubmit = (e) => {
            e.preventDefault();
            this.addWord();
        };
    },

    // Навигация между экранами
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`screen-${screenName}`).classList.add('active');
        if (screenName === 'home') this.loadLists();
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

        // Перемешиваем слова в случайном порядке
        let shuffled = Games.shuffle([...this.currentWords]);

        // Если в списке больше 1 слова и первое слово совпало с последним из прошлого раунда — сдвигаем его
        if (shuffled.length > 1 && shuffled[0].id === this.lastWordId) {
            const first = shuffled.shift();
            shuffled.push(first);
        }

        this.sessionQueue = shuffled;
        this.totalQuestions = this.sessionQueue.length;
        this.correctFirstTry = 0;
        this.sessionPoints = 0;
        this.retriedIds.clear();

        document.getElementById('session-score').textContent = '0';
        this.showScreen('game');
        this.nextQuestion();
    },

nextQuestion() {
        this.stopTimer(); // Останавливаем предыдущий таймер

        if (this.sessionQueue.length === 0) {
            this.finishTraining();
            return;
        }

        const completedCount = this.totalQuestions - this.sessionQueue.length;
        document.getElementById('game-progress').textContent = `${completedCount + 1} / ${this.totalQuestions}`;
        document.getElementById('progress-fill').style.width = `${(completedCount / this.totalQuestions) * 100}%`;

        const currentWord = this.sessionQueue[0];
        const gameArea = document.getElementById('game-area');

        // Единый обработчик завершения задания (успех, ошибка или выход времени)
        const handleResult = (isCorrect) => {
            this.stopTimer();

            fetch(`/api/words/${currentWord.id}/stats`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCorrect })
            });

            if (isCorrect) {
                Feedback.success();
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

        // Запускаем задание
        Games.renderTask(currentWord, this.currentWords, this.currentList.language, gameArea, handleResult);

        // Задаем время: 15 сек для сборки слова из букв, 8 сек для быстрых тестов
        const isAnagram = gameArea.querySelector('.letter-pool') !== null;
        const timeLimit = isAnagram ? 15 : 8;
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
        let timeLeft = seconds * 10; // Считаем в десятых долях секунды для плавности
        const totalTicks = timeLeft;

        const fillEl = document.getElementById('timer-fill');
        const textEl = document.getElementById('timer-text');

        fillEl.style.width = '100%';
        fillEl.classList.remove('danger');
        textEl.classList.remove('danger');
        textEl.textContent = `${seconds}с`;

        this.timerInterval = setInterval(() => {
            timeLeft--;
            const percent = (timeLeft / totalTicks) * 100;
            fillEl.style.width = `${percent}%`;
            textEl.textContent = `${Math.ceil(timeLeft / 10)}с`;

            // В последние 3 секунды включаем красный режим и легкое тиканье
            if (timeLeft <= 30) {
                fillEl.classList.add('danger');
                textEl.classList.add('danger');
                if (timeLeft % 10 === 0 && timeLeft > 0) {
                    Feedback.playTone(800, 'sine', 0.03); // Тихий тик
                }
            }

            if (timeLeft <= 0) {
                this.stopTimer();
                onTimeout();
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