const Games = {
    // Перемешивание массива (алгоритм Фишера-Йейтса)
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    // Главный метод запуска случайного задания для слова
    renderTask(wordObj, allWords, lang, container, onComplete) {
        container.innerHTML = '';

        // Выбираем доступные режимы игры
        const modes = ['anagram']; // Россыпь букв доступна всегда

        if (lang === 'ru') {
            if (wordObj.maskedWord && wordObj.maskedWord.includes('_')) {
                modes.push('missing_letter');
            }
            if (wordObj.wrongVariant) {
                modes.push('true_false');
            }
        } else if (lang === 'en') {
            if (wordObj.translation && allWords.length >= 2) {
                modes.push('en_to_ru', 'ru_to_en');
            }
            if (wordObj.maskedWord && wordObj.maskedWord.includes('_')) {
                modes.push('missing_letter');
            }
        }

        const chosenMode = modes[Math.floor(Math.random() * modes.length)];

        switch (chosenMode) {
            case 'missing_letter':
                this.renderMissingLetter(wordObj, lang, container, onComplete);
                break;
            case 'true_false':
                this.renderTrueFalse(wordObj, container, onComplete);
                break;
            case 'en_to_ru':
                this.renderTranslationTest(wordObj, allWords, 'en_to_ru', container, onComplete);
                break;
            case 'ru_to_en':
                this.renderTranslationTest(wordObj, allWords, 'ru_to_en', container, onComplete);
                break;
            default:
                this.renderAnagram(wordObj, lang, container, onComplete);
        }
    },

    // РЕЖИМ 1: Россыпь букв (Сборка слова)
    renderAnagram(wordObj, lang, container, onComplete) {
        const targetWord = wordObj.word.toLowerCase();
        const letters = this.shuffle(targetWord.split('').map((char, idx) => ({ char, idx })));
        let selected = [];

        const hintText = lang === 'en' && wordObj.translation 
            ? `Перевод: <strong>${wordObj.translation}</strong>` 
            : 'Соберите слово из букв';

        container.innerHTML = `
            <div class="task-card">
                <div class="task-type">🧩 Россыпь букв</div>
                <div class="task-hint">${hintText}</div>
            </div>
            <div class="answer-slots" id="answer-slots"></div>
            <div class="letter-pool" id="letter-pool"></div>
        `;

        const slotsEl = container.querySelector('#answer-slots');
        const poolEl = container.querySelector('#letter-pool');

        const updateView = () => {
            slotsEl.innerHTML = '';
            selected.forEach((item, index) => {
                const tile = document.createElement('div');
                tile.className = 'letter-tile placed';
                tile.textContent = item.char;
                tile.onclick = () => {
                    Feedback.tap();
                    selected.splice(index, 1);
                    updateView();
                };
                slotsEl.appendChild(tile);
            });

            poolEl.innerHTML = '';
            letters.forEach(item => {
                const isUsed = selected.some(s => s.idx === item.idx);
                const tile = document.createElement('div');
                tile.className = `letter-tile ${isUsed ? 'used' : ''}`;
                tile.textContent = item.char;
                tile.onclick = () => {
                    if (isUsed) return;
                    Feedback.tap();
                    selected.push(item);
                    updateView();

                    if (selected.length === targetWord.length) {
                        const resultWord = selected.map(s => s.char).join('');
                        const isCorrect = resultWord === targetWord;
                        setTimeout(() => onComplete(isCorrect), 300);
                    }
                };
                poolEl.appendChild(tile);
            });
        };

        updateView();
    },

    // РЕЖИМ 2: Вставить пропущенную букву
    renderMissingLetter(wordObj, lang, container, onComplete) {
        const masked = wordObj.maskedWord;
        const original = wordObj.word;
        const missingIndex = masked.indexOf('_');
        const correctChar = original[missingIndex].toLowerCase();

        const alphabet = lang === 'ru' ? 'аеиоуыэюя' : 'aeiouy';
        const distractors = this.shuffle(alphabet.split('').filter(c => c !== correctChar)).slice(0, 3);
        const options = this.shuffle([correctChar, ...distractors]);

        container.innerHTML = `
            <div class="task-card">
                <div class="task-type">✍️ Вставьте букву</div>
                <div class="task-word">${masked}</div>
                ${wordObj.translation ? `<div class="task-hint">${wordObj.translation}</div>` : ''}
            </div>
            <div class="options-grid" id="options-grid"></div>
        `;

        const grid = container.querySelector('#options-grid');
        options.forEach(char => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = char.toUpperCase();
            btn.onclick = () => {
                const isCorrect = char === correctChar;
                btn.classList.add(isCorrect ? 'correct' : 'wrong');
                container.querySelector('.task-word').textContent = original;
                setTimeout(() => onComplete(isCorrect), 600);
            };
            grid.appendChild(btn);
        });
    },

    // РЕЖИМ 3: Правда или ложь (для русского языка)
    renderTrueFalse(wordObj, container, onComplete) {
        const showCorrect = Math.random() > 0.5;
        const displayedWord = showCorrect ? wordObj.word : wordObj.wrongVariant;

        container.innerHTML = `
            <div class="task-card">
                <div class="task-type">⚡ Правда или ложь?</div>
                <div class="task-word">${displayedWord}</div>
                <div class="task-hint">Правильно ли написано слово?</div>
            </div>
            <div class="options-grid">
                <button class="option-btn" id="btn-true">✅ Верно</button>
                <button class="option-btn" id="btn-false">❌ Ошибка</button>
            </div>
        `;

        const handleAnswer = (userSaysTrue, btn) => {
            const isCorrect = userSaysTrue === showCorrect;
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
            if (!showCorrect) {
                container.querySelector('.task-hint').innerHTML = `Правильно: <strong>${wordObj.word}</strong>`;
            }
            setTimeout(() => onComplete(isCorrect), 700);
        };

        container.querySelector('#btn-true').onclick = (e) => handleAnswer(true, e.target);
        container.querySelector('#btn-false').onclick = (e) => handleAnswer(false, e.target);
    },

    // РЕЖИМ 4: Тест на перевод (Английский <-> Русский)
    renderTranslationTest(wordObj, allWords, direction, container, onComplete) {
        const isEnToRu = direction === 'en_to_ru';
        const questionText = isEnToRu ? wordObj.word : wordObj.translation;
        const correctAnswer = isEnToRu ? wordObj.translation : wordObj.word;

        // Собираем 3 случайных неправильных варианта из других слов списка
        const otherOptions = this.shuffle(
            allWords
                .filter(w => w.id !== wordObj.id && w.translation)
                .map(w => (isEnToRu ? w.translation : w.word))
        ).slice(0, 3);

        const options = this.shuffle([correctAnswer, ...otherOptions]);

        container.innerHTML = `
            <div class="task-card">
                <div class="task-type">🌐 Выберите перевод</div>
                <div class="task-word">${questionText}</div>
            </div>
            <div class="options-grid" id="options-grid"></div>
        `;

        const grid = container.querySelector('#options-grid');
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => {
                const isCorrect = opt === correctAnswer;
                btn.classList.add(isCorrect ? 'correct' : 'wrong');
                setTimeout(() => onComplete(isCorrect), 600);
            };
            grid.appendChild(btn);
        });
    }
};