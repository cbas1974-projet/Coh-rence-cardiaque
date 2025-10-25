// Mantras sur la ténacité et la persévérance
const MANTRAS = [
    "La persévérance est la clé de toute réussite",
    "Chaque respiration me rend plus fort(e)",
    "Je suis capable de surmonter tous les obstacles",
    "Ma ténacité est ma plus grande force",
    "Pas après pas, je progresse vers mes objectifs",
    "Les difficultés forgent mon caractère",
    "Je ne renonce jamais, je m'adapte",
    "Chaque jour est une nouvelle opportunité de grandir",
    "Ma détermination est inébranlable",
    "Je transforme mes défis en victoires",
    "La constance mène à l'excellence",
    "Je suis maître de mon destin",
    "Mes efforts d'aujourd'hui sont mes succès de demain",
    "Je cultive la patience et la persévérance",
    "Chaque obstacle rend ma volonté plus forte",
    "Je respire, je me recentre, je continue",
    "Ma résilience est mon superpouvoir",
    "Je choisis d'avancer, toujours",
    "Les champions continuent quand les autres abandonnent",
    "Ma discipline quotidienne forge mon avenir"
];

// État de l'application
class CoherenceApp {
    constructor() {
        this.settings = this.loadSettings();
        this.stats = this.loadStats();
        this.isRunning = false;
        this.isPaused = false;
        this.currentPhase = 'ready'; // ready, inhale, exhale
        this.sessionStartTime = null;
        this.timeRemaining = this.settings.duration * 60;
        this.cycleCount = 0;
        this.currentMantraIndex = 0;
        this.breathTimer = null;
        this.sessionTimer = null;

        this.initializeElements();
        this.attachEventListeners();
        this.updateStatsDisplay();
        this.updateSettingsDisplay();
        this.checkStreak();
    }

    // Initialisation des éléments DOM
    initializeElements() {
        // Stats
        this.streakEl = document.getElementById('streak');
        this.totalSessionsEl = document.getElementById('totalSessions');
        this.totalTimeEl = document.getElementById('totalTime');

        // Breathing
        this.breathingCircle = document.getElementById('breathingCircle');
        this.breathText = document.getElementById('breathText');
        this.mantraText = document.getElementById('mantraText');

        // Controls
        this.timerEl = document.getElementById('timer');
        this.progressFill = document.getElementById('progressFill');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.cycleCounterEl = document.getElementById('cycleCounter');

        // Settings
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.closeSettings = document.getElementById('closeSettings');
        this.inhaleRange = document.getElementById('inhaleRange');
        this.exhaleRange = document.getElementById('exhaleRange');
        this.durationRange = document.getElementById('durationRange');
        this.inhaleValue = document.getElementById('inhaleValue');
        this.exhaleValue = document.getElementById('exhaleValue');
        this.durationValue = document.getElementById('durationValue');
        this.resetStatsBtn = document.getElementById('resetStats');

        // Toast
        this.achievementToast = document.getElementById('achievementToast');
    }

    // Attacher les événements
    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.startSession());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.stopBtn.addEventListener('click', () => this.stopSession());

        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettings.addEventListener('click', () => this.closeSettingsPanel());

        this.inhaleRange.addEventListener('input', (e) => this.updateSetting('inhale', parseFloat(e.target.value)));
        this.exhaleRange.addEventListener('input', (e) => this.updateSetting('exhale', parseFloat(e.target.value)));
        this.durationRange.addEventListener('input', (e) => this.updateSetting('duration', parseInt(e.target.value)));

        this.resetStatsBtn.addEventListener('click', () => this.resetStats());
    }

    // Gestion des paramètres
    loadSettings() {
        const defaults = {
            inhale: 5,
            exhale: 5,
            duration: 5 // en minutes
        };
        const saved = localStorage.getItem('coherence_settings');
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    }

    saveSettings() {
        localStorage.setItem('coherence_settings', JSON.stringify(this.settings));
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.updateSettingsDisplay();

        if (!this.isRunning) {
            this.timeRemaining = this.settings.duration * 60;
            this.updateTimerDisplay();
        }
    }

    updateSettingsDisplay() {
        this.inhaleRange.value = this.settings.inhale;
        this.exhaleRange.value = this.settings.exhale;
        this.durationRange.value = this.settings.duration;

        this.inhaleValue.textContent = `${this.settings.inhale}s`;
        this.exhaleValue.textContent = `${this.settings.exhale}s`;
        this.durationValue.textContent = `${this.settings.duration} min`;
    }

    // Gestion des statistiques
    loadStats() {
        const defaults = {
            totalSessions: 0,
            totalTime: 0,
            streak: 0,
            lastSessionDate: null,
            completedSessions: []
        };
        const saved = localStorage.getItem('coherence_stats');
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    }

    saveStats() {
        localStorage.setItem('coherence_stats', JSON.stringify(this.stats));
    }

    updateStatsDisplay() {
        this.streakEl.textContent = this.stats.streak;
        this.totalSessionsEl.textContent = this.stats.totalSessions;

        const hours = Math.floor(this.stats.totalTime / 60);
        const mins = this.stats.totalTime % 60;
        this.totalTimeEl.textContent = hours > 0 ? `${hours}h${mins}m` : `${mins}m`;
    }

    checkStreak() {
        const today = new Date().toDateString();
        const lastDate = this.stats.lastSessionDate;

        if (!lastDate) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastDate !== today && lastDate !== yesterday.toDateString()) {
            this.stats.streak = 0;
            this.saveStats();
            this.updateStatsDisplay();
        }
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastDate = this.stats.lastSessionDate;

        if (lastDate === today) {
            return; // Déjà compté aujourd'hui
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastDate === yesterday.toDateString()) {
            this.stats.streak++;
        } else if (!lastDate || lastDate !== today) {
            this.stats.streak = 1;
        }

        this.stats.lastSessionDate = today;
    }

    resetStats() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes vos statistiques ?')) {
            this.stats = {
                totalSessions: 0,
                totalTime: 0,
                streak: 0,
                lastSessionDate: null,
                completedSessions: []
            };
            this.saveStats();
            this.updateStatsDisplay();
            this.showAchievement('📊 Statistiques réinitialisées - Nouveau départ !');
        }
    }

    // Gestion de la session
    startSession() {
        this.isRunning = true;
        this.isPaused = false;
        this.sessionStartTime = Date.now();
        this.timeRemaining = this.settings.duration * 60;
        this.cycleCount = 0;

        // Mise à jour de l'UI
        this.startBtn.classList.add('hidden');
        this.pauseBtn.classList.remove('hidden');
        this.stopBtn.classList.remove('hidden');

        // Démarrer les timers
        this.startBreathingCycle();
        this.startSessionTimer();

        // Premier mantra
        this.showRandomMantra();
    }

    togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.pauseBtn.textContent = 'Reprendre';
            this.breathText.textContent = 'En pause...';
            this.breathingCircle.classList.remove('inhale', 'exhale', 'breathing');
            clearTimeout(this.breathTimer);
        } else {
            this.pauseBtn.textContent = 'Pause';
            this.startBreathingCycle();
        }
    }

    stopSession() {
        if (!confirm('Voulez-vous vraiment arrêter la session ?')) {
            return;
        }

        this.isRunning = false;
        this.isPaused = false;

        // Arrêter les timers
        clearTimeout(this.breathTimer);
        clearInterval(this.sessionTimer);

        // Réinitialiser l'UI
        this.breathingCircle.classList.remove('inhale', 'exhale', 'breathing');
        this.breathText.textContent = 'Prêt à recommencer ?';
        this.mantraText.textContent = '';
        this.startBtn.classList.remove('hidden');
        this.pauseBtn.classList.add('hidden');
        this.stopBtn.classList.add('hidden');
        this.pauseBtn.textContent = 'Pause';

        // Réinitialiser le timer
        this.timeRemaining = this.settings.duration * 60;
        this.updateTimerDisplay();
        this.updateProgress();
        this.updateCycleCounter();
    }

    completeSession() {
        const sessionDuration = this.settings.duration;

        // Mettre à jour les stats
        this.stats.totalSessions++;
        this.stats.totalTime += sessionDuration;
        this.updateStreak();
        this.stats.completedSessions.push({
            date: new Date().toISOString(),
            duration: sessionDuration
        });

        this.saveStats();
        this.updateStatsDisplay();

        // Célébration
        this.celebrateCompletion();

        // Réinitialiser
        this.isRunning = false;
        this.breathingCircle.classList.remove('inhale', 'exhale', 'breathing');
        this.startBtn.classList.remove('hidden');
        this.pauseBtn.classList.add('hidden');
        this.stopBtn.classList.add('hidden');
        this.timeRemaining = this.settings.duration * 60;
        this.updateTimerDisplay();
        this.updateProgress();
    }

    // Cycle de respiration
    startBreathingCycle() {
        if (!this.isRunning || this.isPaused) return;

        this.currentPhase = 'inhale';
        this.breathText.textContent = 'Inspirez...';
        this.breathingCircle.classList.remove('exhale');
        this.breathingCircle.classList.add('inhale', 'breathing');

        // Définir la durée CSS
        this.breathingCircle.style.setProperty('--inhale-duration', `${this.settings.inhale}s`);

        this.breathTimer = setTimeout(() => {
            this.startExhale();
        }, this.settings.inhale * 1000);
    }

    startExhale() {
        if (!this.isRunning || this.isPaused) return;

        this.currentPhase = 'exhale';
        this.breathText.textContent = 'Expirez...';
        this.breathingCircle.classList.remove('inhale');
        this.breathingCircle.classList.add('exhale');

        // Définir la durée CSS
        this.breathingCircle.style.setProperty('--exhale-duration', `${this.settings.exhale}s`);

        this.breathTimer = setTimeout(() => {
            this.cycleCount++;
            this.updateCycleCounter();

            // Changer de mantra tous les 3 cycles
            if (this.cycleCount % 3 === 0) {
                this.showRandomMantra();
            }

            this.startBreathingCycle();
        }, this.settings.exhale * 1000);
    }

    // Timer de session
    startSessionTimer() {
        this.sessionTimer = setInterval(() => {
            if (this.isPaused) return;

            this.timeRemaining--;
            this.updateTimerDisplay();
            this.updateProgress();

            if (this.timeRemaining <= 0) {
                clearInterval(this.sessionTimer);
                clearTimeout(this.breathTimer);
                this.completeSession();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const mins = Math.floor(this.timeRemaining / 60);
        const secs = this.timeRemaining % 60;
        this.timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    updateProgress() {
        const totalSeconds = this.settings.duration * 60;
        const progress = ((totalSeconds - this.timeRemaining) / totalSeconds) * 100;
        this.progressFill.style.width = `${progress}%`;
    }

    updateCycleCounter() {
        this.cycleCounterEl.textContent = `${this.cycleCount} cycle${this.cycleCount > 1 ? 's' : ''}`;
    }

    // Mantras
    showRandomMantra() {
        this.currentMantraIndex = Math.floor(Math.random() * MANTRAS.length);
        this.mantraText.textContent = `"${MANTRAS[this.currentMantraIndex]}"`;
    }

    // Achievements et célébrations
    celebrateCompletion() {
        // Animation de célébration
        this.breathingCircle.classList.add('celebrate');
        setTimeout(() => this.breathingCircle.classList.remove('celebrate'), 600);

        // Message personnalisé selon les achievements
        let message = '🎉 Session complétée ! Bravo !';

        if (this.stats.streak === 7) {
            message = '🔥 7 jours de suite ! Quelle discipline !';
        } else if (this.stats.streak === 30) {
            message = '🏆 30 jours ! Vous êtes une légende !';
        } else if (this.stats.totalSessions === 10) {
            message = '⭐ 10 sessions complétées ! Continuez !';
        } else if (this.stats.totalSessions === 50) {
            message = '💎 50 sessions ! Expert en cohérence cardiaque !';
        } else if (this.stats.totalSessions === 100) {
            message = '👑 100 sessions ! Maître de la respiration !';
        } else if (this.stats.streak > 0) {
            message = `🔥 ${this.stats.streak} jour${this.stats.streak > 1 ? 's' : ''} de suite ! Continuez !`;
        }

        this.showAchievement(message);
        this.breathText.textContent = 'Session terminée ! ✨';
        this.mantraText.textContent = '"La constance mène à l\'excellence"';
    }

    showAchievement(message) {
        this.achievementToast.textContent = message;
        this.achievementToast.classList.remove('hidden');
        this.achievementToast.classList.add('show');

        setTimeout(() => {
            this.achievementToast.classList.remove('show');
            setTimeout(() => {
                this.achievementToast.classList.add('hidden');
            }, 500);
        }, 3000);
    }

    // Paramètres UI
    openSettings() {
        this.settingsPanel.classList.add('show');
    }

    closeSettingsPanel() {
        this.settingsPanel.classList.remove('show');
    }
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    const app = new CoherenceApp();

    // Message de bienvenue pour les nouveaux utilisateurs
    if (app.stats.totalSessions === 0) {
        setTimeout(() => {
            app.showAchievement('🫀 Bienvenue ! Commencez votre voyage vers la sérénité');
        }, 1000);
    }
});
