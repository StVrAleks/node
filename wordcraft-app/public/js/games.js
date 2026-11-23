const Games = {
    currentKeyHandler: null,

    clearKeyHandler() {
        if (this.currentKeyHandler) {
            document.removeEventListener('keydown', this.currentKeyHandler);
            this.currentKeyHandler = null;
        }
    },

    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    renderTask(wordObj, allWords, lang, container, onComplete) {
        this.clearKeyHandler();
        container.innerHTML = '';

        const finishTask = (isCorrect) => {
            this.clearKeyHandler();
            onComplete(isCorrect);
        };

        // Четкое разделение режимов без склейки
        const modes = ['anagram']; // 1. Сборка целого слова по буквам

        if (lang === 'ru') {
            if (wordObj.maskedWord && wordObj.maskedWord.includes('_')) {
                modes.push('missing_letter'); // 2. Выбор пропущенной буквы
            }
            if (wordObj.wrongVariant) {
                modes.push('true_false'); // 3. Правда или ложь
            }
        } else if (lang === 'en') {
            if (wordObj.maskedWord && wordObj.maskedWord.includes('_')) {
                modes.push('missing_letter'); // 2. Выбор пропущенной буквы
            }
            if (wordObj.translation && allWords.length >= 2) {
                modes.push('en_to_ru', 'ru_to_en'); // 3. Тест на перевод
            }
            const wordsWithTrans = allWords.filter(w => w.translation);
            if (wordObj.translation && wordsWithTrans.length >= 4) {
                modes.push('match_pairs'); // 4. Два столбика (соотнести пары)
            }
        }

        const chosenMode = modes[Math.floor(Math.random() * modes.length)];

        switch (chosenMode) {
            case 'missing_letter':
                this.renderMissingLetter(wordObj, lang, container, finishTask);
                break;
            case 'true_false':
                this.renderTrueFalse(wordObj, container, finishTask);
                break;
            case 'en_to_ru':
                this.renderTranslationTest(wordObj, allWords, 'en_to_ru', container, finishTask);
                break;
            case 'ru_to_en':
                this.renderTranslationTest(wordObj, allWords, 'ru_to_en', container, finishTask);
                break;
            case 'match_pairs':
                this.renderMatchPairs(wordObj, allWords, container, finishTask);
                break;
            default:
                this.renderAnagram(wordObj, lang, container, finishTask);
        }
    },

    // РЕЖИМ 1: Сборка слова по буквам (с клеточками кроссворда и проверкой каждой буквы)
    renderAnagram(wordObj, lang, container, onComplete) {
        const targetWord = wordObj.word.toLowerCase();
        const letters = this.shuffle(targetWord.split('').map((char, idx) => ({ char, idx, used: false })));
        let currentIndex = 0;
        let hadError = false;
        let isCompleted = false;

        const hintText = lang === 'en' && wordObj.translation
            ? `Перевод: <strong>${wordObj.translation}</strong>`
            : 'Соберите слово по буквам (можно печатать с клавиатуры)';

        container.innerHTML = `
            <div class="task-card">
                <div class="task-type">🧩 Сборка слова</div>
                <div class="task-hint">${hintText}</div>
            </div>
            <div class="answer-slots" id="answer-slots"></div>
            <div class="letter-pool" id="letter-pool"></div>
        `;

        const slotsEl = container.querySelector('#answer-slots');
        const poolEl = container.querySelector('#letter-pool');

        // Создаем клеточки "кроссворда" по длине слова
        const slotEls = [];
        for (let i = 0; i < targetWord.length; i++) {
            const slot = document.createElement('div');
            slot.className = `crossword-slot ${i === 0 ? 'active' : ''}`;
            slotsEl.appendChild(slot);
            slotEls.push(slot);
        }

        const tryLetter = (letterItem, tileEl) => {
            if (isCompleted || letterItem.used) return;

            const expectedChar = targetWord[currentIndex];
            const activeSlot = slotEls[currentIndex];

            if (letterItem.char === expectedChar) {
                // Правильная буква — встает в клеточку
                Feedback.tap();
                letterItem.used = true;
                tileEl.classList.add('used');

                activeSlot.textContent = letterItem.char.toUpperCase();
                activeSlot.classList.remove('active', 'error');
                activeSlot.classList.add('filled');

                currentIndex++;
                if (currentIndex < targetWord.length) {
                    slotEls[currentIndex].classList.add('active');
                } else {
                    isCompleted = true;
                    setTimeout(() => onComplete(!hadError), 350);
                }
            } else {
                // Ошибка — клеточка подсвечивается красным, буква остается на месте
                Feedback.error();
                hadError = true;
                activeSlot.classList.remove('error');
                void activeSlot.offsetWidth; // перезапуск CSS-анимации
                activeSlot.classList.add('error');

                setTimeout(() => {
                    activeSlot.classList.remove('error');
                }, 450);
            }
        };

        // Отрисовка доступных букв внизу
        const tileMap = [];
        letters.forEach(item => {
            const tile = document.createElement('div');
            tile.className = 'letter-tile';
            tile.textContent = item.char.toUpperCase();
            tile.onclick = () => tryLetter(item, tile);
            poolEl.appendChild(tile);
            tileMap.push({ item, tile });
        });

        // Поддержка ввода с клавиатуры на ПК
        this.currentKeyHandler = (e) => {
            if (typeof App !== 'undefined' && (!App.isGameActive || App.isPaused)) return;
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            const pressed = e.key.toLowerCase();
            if (pressed.length === 1) {
                const found = tileMap.find(entry => !entry.item.used && entry.item.char === pressed);
                if (found) {
                    e.preventDefault();
                    tryLetter(found.item, found.tile);
                } else if (/^[a-zа-яё]$/.test(pressed)) {
                    // Нажали букву, которой вообще нет в слове — тоже подсветим ошибку в клеточке
                    tryLetter({ char: pressed, used: false }, document.createElement('div'));
                }
            }
        };
        document.addEventListener('keydown', this.currentKeyHandler);
    },

    // РЕЖИМ 2: Вставить пропущенную букву (отдельный режим)
    renderMissingLetter(wordObj, lang, container, onComplete) {
        const masked = wordObj.maskedWord;
        const original = wordObj.word;
        const missingIndex = masked.indexOf('_');
        const correctChar = original[missingIndex].toLowerCase();

        const alphabet = lang === 'ru' ? 'аеиоуыэюя' : 'aeiouy';
        const distractors = this.shuffle(alphabet.split('').filter(c => c !== correctChar)).slice(0, 3);
        const options = this.shuffle([correctChar, ...distractors]);
        let answered = false;

        container.innerHTML = `
            <div class="task-card">
                <div class="task-type">✍️ Вставьте пропущенную букву</div>
                <div class="task-word">${masked}</div>
                ${wordObj.translation ? `<div class="task-hint">${wordObj.translation}</div>` : ''}
            </div>
            <div class="options-grid" id="options-grid"></div>
        `;

        const grid = container.querySelector('#options-grid');
        const buttons = [];

        options.forEach((char, idx) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span class="key-hint">${idx + 1}</span> ${char.toUpperCase()}`;
            btn.onclick = () => {
                if (answered) return;
                answered = true;
                const isCorrect = char === correctChar;
                btn.classList.add(isCorrect ? 'correct' : 'wrong');
                container.querySelector('.task-word').textContent = original;
                setTimeout(() => onComplete(isCorrect), 600);
            };
            grid.appendChild(btn);
            buttons.push(btn);
        });

        this.bindNumberKeys(buttons);
    },

    // РЕЖИМ 3: Правда или ложь (для русского языка)
    renderTrueFalse(wordObj, container, onComplete) {
        const showCorrect = Math.random() > 0.5;
        const displayedWord = showCorrect ? wordObj.word : wordObj.wrongVariant;
        let answered = false;

        container.innerHTML = `
            <div class="task-card">
                <div class="task-type">⚡ Правда или ложь?</div>
                <div class="task-word">${displayedWord}</div>
                <div class="task-hint">Правильно ли написано слово?</div>
            </div>
            <div class="options-grid">
                <button class="option-btn" id="btn-true"><span class="key-hint">1</span> ✅ Верно</button>
                <button class="option-btn" id="btn-false"><span class="key-hint">2</span> ❌ Ошибка</button>
            </div>
        `;

        const btnTrue = container.querySelector('#btn-true');
        const btnFalse = container.querySelector('#btn-false');

        const handleAnswer = (userSaysTrue, btn) => {
            if (answered) return;
            answered = true;
            const isCorrect = userSaysTrue === showCorrect;
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
            if (!showCorrect) {
           container.innerHTML = `
            <div class="task-card">
                <div class="task-type">⚡ Правда или ложь?</div>
                <div class="task-word">${displayedWord}</div>
                <div class="task-hint">Правильно ли написано слово?</div>
            </div>
            <div class="options-grid">
                <button class="option-btn" id="btn-true"><span class="key-hint">1</span> ✅ Верно</button>
                <button class="option-btn" id="btn-false"><span class="key-hint">2</span> ❌ Ошибка</button>
            </div>
        `;
}
setTimeout(() => onComplete(isCorrect), 700);
};
btnTrue.onclick = () => handleAnswer(true, btnTrue);
btnFalse.onclick = () => handleAnswer(false, btnFalse);
this.bindNumberKeys([btnTrue, btnFalse]);
},
// РЕЖИМ 4: Тест на перевод (Английский <-> Русский)
renderTranslationTest(wordObj, allWords, direction, container, onComplete) {
const isEnToRu = direction === 'en_to_ru';
const questionText = isEnToRu ? wordObj.word : wordObj.translation;
const correctAnswer = isEnToRu ? wordObj.translation : wordObj.word;
let answered = false;
const otherOptions = this.shuffle(
allWords
.filter(w => w.id !== wordObj.id && w.translation)
.map(w => (isEnToRu ? w.translation : w.word))
).slice(0, 3);
const options = this.shuffle([correctAnswer, ...otherOptions]);
container.innerHTML = `<div class="task-card"><div class="task-type"> 🌐Выберите перевод </div> <div class="task-word">${questionText}</div> </div> <div class="options-grid" id="options-grid"></div>`;
const grid = container.querySelector('#options-grid');
const buttons = [];
options.forEach((opt, idx) => {
const btn = document.createElement('button');
btn.className = 'option-btn';
btn.innerHTML = `<span class="key-hint">${idx + 1}</span> ${opt}`;
btn.onclick = () => {
if (answered) return;
answered = true;
const isCorrect = opt === correctAnswer;
btn.classList.add(isCorrect ? 'correct' : 'wrong');
setTimeout(() => onComplete(isCorrect), 600);
};
grid.appendChild(btn);
buttons.push(btn);
});
this.bindNumberKeys(buttons);
},
// РЕЖИМ 5: Соотнеси пары (2 столбика для английского)
renderMatchPairs(wordObj, allWords, container, onComplete) {
const others = this.shuffle(allWords.filter(w => w.id !== wordObj.id && w.translation)).slice(0, 4);
const pairWords = [wordObj, ...others];
const leftItems = this.shuffle(pairWords.map(w => ({ id: w.id, text: w.word })));
const rightItems = this.shuffle(pairWords.map(w => ({ id: w.id, text: w.translation })));
let selectedLeft = null;
let selectedRight = null;
let matchedCount = 0;
container.innerHTML = `<div class="task-card" style="padding: 18px; margin-bottom: 14px;"> <div class="task-type">🔗 Соотнесите пары</div> <div class="task-hint">Нажмите на английское слово и его перевод</div> </div> <div class="match-grid"> <div class="match-col" id="match-left"></div> <div class="match-col" id="match-right"></div> </div>`;
const leftCol = container.querySelector('#match-left');
const rightCol = container.querySelector('#match-right');
const checkMatch = () => {
if (!selectedLeft || !selectedRight) return;
const l = selectedLeft;
const r = selectedRight;
selectedLeft = null;
selectedRight = null;
if (l.id === r.id) {
Feedback.tap();
l.el.classList.remove('selected');
r.el.classList.remove('selected');
l.el.classList.add('matched');
r.el.classList.add('matched');
matchedCount++;
if (matchedCount === pairWords.length) {
setTimeout(() => onComplete(true), 450);
}
} else {
Feedback.error();
l.el.classList.remove('selected');
r.el.classList.remove('selected');
l.el.classList.add('wrong');
r.el.classList.add('wrong');
setTimeout(() => {
l.el.classList.remove('wrong');
r.el.classList.remove('wrong');
}, 400);
}
};
leftItems.forEach(item => {
const btn = document.createElement('button');
btn.className = 'match-card';
btn.textContent = item.text;
btn.onclick = () => {
if (btn.classList.contains('matched')) return;
leftCol.querySelectorAll('.match-card').forEach(el => el.classList.remove('selected'));
btn.classList.add('selected');
selectedLeft = { id: item.id, el: btn };
checkMatch();
};
leftCol.appendChild(btn);
});
rightItems.forEach(item => {
const btn = document.createElement('button');
btn.className = 'match-card';
btn.textContent = item.text;
btn.onclick = () => {
if (btn.classList.contains('matched')) return;
rightCol.querySelectorAll('.match-card').forEach(el => el.classList.remove('selected'));
btn.classList.add('selected');
selectedRight = { id: item.id, el: btn };
checkMatch();
};
rightCol.appendChild(btn);
});
},
bindNumberKeys(buttons) {
this.currentKeyHandler = (e) => {
if (typeof App !== 'undefined' && (!App.isGameActive || App.isPaused)) return;
const num = parseInt(e.key, 10);
if (num >= 1 && num <= buttons.length) {
e.preventDefault();
buttons[num - 1].click();
}
};
document.addEventListener('keydown', this.currentKeyHandler);
}
};
