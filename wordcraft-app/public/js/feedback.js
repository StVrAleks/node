const Feedback = {
    isMuted: localStorage.getItem('wordcraft_muted') === 'true',
    audioCtx: null,

    // Инициализация звука при первом касании экрана (требование мобильных браузеров)
    initAudio() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    },

    // Вспомогательная функция для генерации ноты
    playTone(freq, type, duration, delay = 0) {
        if (this.isMuted) return;
        this.initAudio();

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = type; // 'sine', 'triangle', 'square'
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + delay);

        gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + delay + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + delay);
        osc.stop(this.audioCtx.currentTime + delay + duration);
    },

    // Безопасный вызов вибрации
    vibrate(pattern) {
        if (!this.isMuted && 'vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    },

    // --- Игровые события ---
    tap() {
        this.playTone(600, 'sine', 0.05);
        this.vibrate(15);
    },

    success() {
        this.playTone(523.25, 'triangle', 0.12, 0);    // Нота До
        this.playTone(659.25, 'triangle', 0.2, 0.1);   // Нота Ми
        this.vibrate([40, 40, 70]);
    },

    error() {
        this.playTone(220, 'sawtooth', 0.15, 0);
        this.playTone(180, 'sawtooth', 0.25, 0.12);
        this.vibrate(250);
    },

    win() {
        this.playTone(523.25, 'triangle', 0.12, 0);
        this.playTone(659.25, 'triangle', 0.12, 0.1);
        this.playTone(783.99, 'triangle', 0.12, 0.2);
        this.playTone(1046.50, 'triangle', 0.35, 0.3);
        this.vibrate([60, 50, 60, 50, 150]);
    }
};