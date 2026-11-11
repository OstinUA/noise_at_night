(() => {
    'use strict';

    /* ---------------------------------------------------------------------
     * Configuration
     * ------------------------------------------------------------------ */

    const SOUNDS = Object.freeze([
        { id: 'Rain', icon: 'icons/free-icon-rain-weather-cloud-outline-symbol-with-raindrops-lines-54456.png', audio: 'sounds/soft-rain-on-a-tile-roof-14515.mp3' },
        { id: 'Storm', icon: 'icons/free-icon-winds-lines-weather-storm-55036.png', audio: 'sounds/rain-and-wind-chimes-314370.mp3' },
        { id: 'Wind', icon: 'icons/free-icon-winds-lines-weather-symbol-55037.png', audio: 'sounds/soft-wind-316392.mp3' },
        { id: 'Forest', icon: 'icons/free-icon-forest-1167380.png', audio: 'sounds/forest-wind-355613.mp3' },
        { id: 'Ocean', icon: 'icons/free-icon-weather-interface-symbol-of-a-semicircle-on-three-lines-perspective-54741.png', audio: 'sounds/ocean-waves-250310.mp3' },
        { id: 'Hurricane', icon: 'icons/free-icon-wind-socket-outlined-symbol-54561.png', audio: 'sounds/rain-and-thunder-321270.mp3' },
        { id: 'Night', icon: 'icons/free-icon-fog-at-night-weather-symbol-54523.png', audio: 'sounds/night-ambience-17064.mp3' },
        { id: 'Fire', icon: 'icons/free-icon-hot-interface-symbol-of-fire-flames-outline-54409.png', audio: 'sounds/crackling-fire-14759.mp3' },
        { id: 'Birds', icon: 'icons/free-icon-sun-day-weather-symbol-54455.png', audio: 'sounds/birds-19624.mp3' },
        { id: 'City', icon: 'icons/free-icon-recycling-bin-54324.png', audio: 'sounds/night-city-339223.mp3' }
    ]);

    // Built-in mixes map sound ids to per-sound volume (0-100).
    const BUILT_IN_MIXES = Object.freeze([
        { key: 'mixRainyNight', levels: { Rain: 60, Night: 35, Wind: 20 } },
        { key: 'mixCampfire', levels: { Fire: 65, Night: 40, Forest: 25 } },
        { key: 'mixSeaside', levels: { Ocean: 65, Wind: 25, Birds: 15 } },
        { key: 'mixThunderstorm', levels: { Hurricane: 60, Storm: 35, Wind: 30 } },
        { key: 'mixMorningForest', levels: { Forest: 50, Birds: 45 } }
    ]);

    const TIMER_PRESETS_MIN = Object.freeze([15, 30, 60, 90]);

    const STORAGE_KEY = 'sleepSoundsData';
    const STORAGE_VERSION = 2;
    const SAVE_DEBOUNCE_MS = 250;

    const DEFAULT_VOLUME = 50;
    const DEFAULT_TIMER_MIN = 50;
    const MAX_TIMER_MIN = 999;
    const TIMER_TICK_MS = 250;
    // Playback is faded out over the tail of the timer instead of cutting off abruptly.
    const FADE_OUT_MS = 30000;

    const MAX_CUSTOM_MIXES = 12;
    const MAX_MIX_NAME_LENGTH = 24;

    const SUPPORTED_LANGUAGES = Object.freeze(['uk', 'en']);

    const MESSAGES = Object.freeze({
        uk: {
            appTitle: 'Звуки для сну',
            timerHeading: 'Таймер сну',
            timerDisplayLabel: 'Час до вимкнення',
            minutesLabel: 'Тривалість таймера у хвилинах',
            minutesSuffix: 'хв',
            timerStart: 'Старт',
            timerResume: 'Продовжити',
            timerPause: 'Пауза',
            timerReset: 'Стоп',
            timerPresetsLabel: 'Швидкий вибір тривалості',
            timerPreset: '{n} хв',
            timerFinished: 'Таймер завершено, відтворення зупинено',
            mixerHeading: 'Мікс',
            play: 'Відтворити',
            pause: 'Пауза',
            mute: 'Без звуку',
            masterVolume: 'Загальна гучність',
            shuffle: 'Випадковий мікс',
            clear: 'Вимкнути все',
            mixListLabel: 'Готові та збережені мікси',
            saveMix: '+ Зберегти мікс',
            mixNamePlaceholder: 'Назва мікса',
            save: 'Зберегти',
            cancel: 'Скасувати',
            deleteMix: 'Видалити мікс «{name}»',
            mixSaved: 'Мікс «{name}» збережено',
            mixDeleted: 'Мікс «{name}» видалено',
            mixLimit: 'Можна зберегти не більше {n} міксів',
            soundsLabel: 'Звуки',
            volumeOf: 'Гучність: {name}',
            soundFailed: 'Не вдалося завантажити звук «{name}»',
            shortcutsHint: 'Пробіл — відтворення / пауза · M — без звуку · 1–0 — увімкнути звук',
            switchLanguage: 'English',
            mixRainyNight: 'Дощова ніч',
            mixCampfire: 'Біля багаття',
            mixSeaside: 'Узбережжя',
            mixThunderstorm: 'Гроза',
            mixMorningForest: 'Ранковий ліс',
            soundRain: 'Дощ',
            soundStorm: 'Гроза',
            soundWind: 'Вітер',
            soundForest: 'Ліс',
            soundOcean: 'Океан',
            soundHurricane: 'Ураган',
            soundNight: 'Ніч',
            soundFire: 'Багаття',
            soundBirds: 'Птахи',
            soundCity: 'Місто'
        },
        en: {
            appTitle: 'Sleep Sounds',
            timerHeading: 'Sleep timer',
            timerDisplayLabel: 'Time until playback stops',
            minutesLabel: 'Timer duration in minutes',
            minutesSuffix: 'min',
            timerStart: 'Start',
            timerResume: 'Resume',
            timerPause: 'Pause',
            timerReset: 'Stop',
            timerPresetsLabel: 'Quick duration presets',
            timerPreset: '{n} min',
            timerFinished: 'Timer finished, playback stopped',
            mixerHeading: 'Mix',
            play: 'Play',
            pause: 'Pause',
            mute: 'Mute',
            masterVolume: 'Master volume',
            shuffle: 'Random mix',
            clear: 'Turn all off',
            mixListLabel: 'Built-in and saved mixes',
            saveMix: '+ Save mix',
            mixNamePlaceholder: 'Mix name',
            save: 'Save',
            cancel: 'Cancel',
            deleteMix: 'Delete mix "{name}"',
            mixSaved: 'Mix "{name}" saved',
            mixDeleted: 'Mix "{name}" deleted',
            mixLimit: 'You can save up to {n} mixes',
            soundsLabel: 'Sounds',
            volumeOf: 'Volume: {name}',
            soundFailed: 'Could not load the "{name}" sound',
            shortcutsHint: 'Space — play / pause · M — mute · 1–0 — toggle a sound',
            switchLanguage: 'Українська',
            mixRainyNight: 'Rainy night',
            mixCampfire: 'Campfire',
            mixSeaside: 'Seaside',
            mixThunderstorm: 'Thunderstorm',
            mixMorningForest: 'Morning forest',
            soundRain: 'Rain',
            soundStorm: 'Storm',
            soundWind: 'Wind',
            soundForest: 'Forest',
            soundOcean: 'Ocean',
            soundHurricane: 'Hurricane',
            soundNight: 'Night',
            soundFire: 'Campfire',
            soundBirds: 'Birds',
            soundCity: 'City'
        }
    });

    /* ---------------------------------------------------------------------
     * Small helpers
     * ------------------------------------------------------------------ */

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const isPlainObject = (value) =>
        value !== null && typeof value === 'object' && !Array.isArray(value);

    /** Coerces anything to an integer within [min, max], or returns the fallback. */
    function toBoundedInt(value, min, max, fallback) {
        const number = typeof value === 'string' ? Number.parseInt(value, 10) : value;
        return Number.isFinite(number) ? clamp(Math.round(number), min, max) : fallback;
    }

    function createElement(tag, props = {}, children = []) {
        const element = document.createElement(tag);
        const { attrs, ...direct } = props;
        Object.assign(element, direct);
        if (attrs) {
            for (const [name, value] of Object.entries(attrs)) {
                element.setAttribute(name, value);
            }
        }
        element.append(...children);
        return element;
    }

    /* ---------------------------------------------------------------------
     * Application state
     * ------------------------------------------------------------------ */

    const state = {
        // id -> { volume: 0-100, active: boolean }
        sounds: new Map(SOUNDS.map(({ id }) => [id, { volume: DEFAULT_VOLUME, active: false }])),
        masterVolume: 100,
        muted: false,
        // Global transport flag: active sounds stay selected while paused.
        paused: false,
        timer: {
            targetTime: null,
            pausedRemainingMs: null,
            minutes: DEFAULT_TIMER_MIN
        },
        // [{ name: string, levels: { [id]: volume } }]
        customMixes: [],
        language: detectLanguage()
    };

    const soundIds = new Set(state.sounds.keys());
    const audioElements = new Map();
    const cards = new Map();
    const dom = {};

    let timerIntervalId = null;
    let lastRenderedSeconds = null;
    let saveTimeoutId = null;

    /* ---------------------------------------------------------------------
     * Localisation
     * ------------------------------------------------------------------ */

    function detectLanguage() {
        const preferred = (navigator.languages || [navigator.language || ''])
            .map((tag) => String(tag).toLowerCase().split('-')[0]);
        return preferred.find((code) => SUPPORTED_LANGUAGES.includes(code)) || 'uk';
    }

    function t(key, params = {}) {
        const template = MESSAGES[state.language][key] ?? MESSAGES.uk[key] ?? key;
        return template.replace(/\{(\w+)\}/g, (match, name) =>
            Object.hasOwn(params, name) ? String(params[name]) : match);
    }

    const soundName = (id) => t(`sound${id}`);

    function applyStaticTranslations() {
        document.documentElement.lang = state.language;

        for (const element of document.querySelectorAll('[data-i18n]')) {
            element.textContent = t(element.dataset.i18n);
        }
        for (const element of document.querySelectorAll('[data-i18n-aria-label]')) {
            element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
        }
        for (const element of document.querySelectorAll('[data-i18n-placeholder]')) {
            element.placeholder = t(element.dataset.i18nPlaceholder);
        }
    }

    function announce(message) {
        dom.status.textContent = message;
    }

    /* ---------------------------------------------------------------------
     * Persistence
     * ------------------------------------------------------------------ */

    function serializeState() {
        return {
            version: STORAGE_VERSION,
            sounds: Object.fromEntries(state.sounds),
            masterVolume: state.masterVolume,
            muted: state.muted,
            paused: state.paused,
            timer: { ...state.timer },
            customMixes: state.customMixes,
            language: state.language
        };
    }

    function persistNow() {
        window.clearTimeout(saveTimeoutId);
        saveTimeoutId = null;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState()));
        } catch (error) {
            // Storage can be unavailable (private mode, quota, disabled cookies).
            // The app stays fully usable; settings simply will not survive a reload.
            console.warn('Unable to persist settings:', error);
        }
    }

    /** Coalesces bursts of updates (e.g. slider drags) into a single write. */
    function scheduleSave() {
        if (saveTimeoutId === null) {
            saveTimeoutId = window.setTimeout(persistNow, SAVE_DEBOUNCE_MS);
        }
    }

    function flushPendingSave() {
        if (saveTimeoutId !== null) {
            persistNow();
        }
    }

    /** Keeps only known sound ids with in-range volumes; drops everything else. */
    function sanitizeLevels(raw) {
        const levels = {};
        if (!isPlainObject(raw)) {
            return levels;
        }
        for (const id of soundIds) {
            if (Object.hasOwn(raw, id)) {
                const volume = toBoundedInt(raw[id], 0, 100, null);
                if (volume !== null) {
                    levels[id] = volume;
                }
            }
        }
        return levels;
    }

    function sanitizeMixName(raw) {
        return typeof raw === 'string'
            ? raw.replace(/\s+/g, ' ').trim().slice(0, MAX_MIX_NAME_LENGTH)
            : '';
    }

    function sanitizeCustomMixes(raw) {
        if (!Array.isArray(raw)) {
            return [];
        }
        const mixes = [];
        for (const entry of raw) {
            if (mixes.length >= MAX_CUSTOM_MIXES) {
                break;
            }
            if (!isPlainObject(entry)) {
                continue;
            }
            const name = sanitizeMixName(entry.name);
            const levels = sanitizeLevels(entry.levels);
            if (name && Object.keys(levels).length > 0) {
                mixes.push({ name, levels });
            }
        }
        return mixes;
    }

    /**
     * Restores persisted settings. Stored data is treated as untrusted input:
     * every field is validated and unknown keys are ignored, so a corrupted or
     * hand-edited entry can never break start-up. Also understands the legacy
     * (unversioned) layout so existing users keep their mix.
     */
    function restoreState() {
        let data;
        try {
            data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        } catch (error) {
            console.warn('Ignoring unreadable saved settings:', error);
            return;
        }
        if (!isPlainObject(data)) {
            return;
        }

        if (isPlainObject(data.sounds)) {
            for (const [id, sound] of state.sounds) {
                const saved = Object.hasOwn(data.sounds, id) ? data.sounds[id] : null;
                if (!isPlainObject(saved)) {
                    continue;
                }
                sound.volume = toBoundedInt(saved.volume, 0, 100, DEFAULT_VOLUME);
                sound.active = (saved.active ?? saved.isPlaying) === true;
            }
        }

        state.masterVolume = toBoundedInt(data.masterVolume, 0, 100, 100);
        state.muted = data.muted === true;
        state.paused = data.paused === true;
        state.customMixes = sanitizeCustomMixes(data.customMixes);
        if (SUPPORTED_LANGUAGES.includes(data.language)) {
            state.language = data.language;
        }

        const timer = isPlainObject(data.timer) ? data.timer : {};
        const maxTimerMs = MAX_TIMER_MIN * 60000;
        const targetTime = timer.targetTime ?? data.timerTarget;
        const pausedRemainingMs = toBoundedInt(
            timer.pausedRemainingMs ?? data.pausedRemaining, 1, maxTimerMs, null
        );

        state.timer.minutes = toBoundedInt(timer.minutes, 1, MAX_TIMER_MIN, DEFAULT_TIMER_MIN);

        if (pausedRemainingMs !== null) {
            state.timer.pausedRemainingMs = pausedRemainingMs;
        } else if (Number.isFinite(targetTime)) {
            const remainingMs = targetTime - Date.now();
            if (remainingMs > 0 && remainingMs <= maxTimerMs) {
                state.timer.targetTime = targetTime;
            } else if (remainingMs <= 0) {
                // The timer ran out while the page was closed: honour it and
                // stay silent rather than resuming playback on the next visit.
                state.paused = true;
            }
        }
    }

    /* ---------------------------------------------------------------------
     * Audio engine
     * ------------------------------------------------------------------ */

    const activeIds = () =>
        SOUNDS.filter(({ id }) => state.sounds.get(id).active).map(({ id }) => id);

    const isAudible = () => !state.paused && activeIds().length > 0;

    /** Gain applied on top of user volumes while the timer is in its final seconds. */
    function timerFadeGain() {
        const { targetTime } = state.timer;
        if (targetTime === null) {
            return 1;
        }
        return clamp((targetTime - Date.now()) / FADE_OUT_MS, 0, 1);
    }

    function effectiveVolume(id) {
        if (state.muted) {
            return 0;
        }
        const level = (state.sounds.get(id).volume / 100) * (state.masterVolume / 100);
        return clamp(level * timerFadeGain(), 0, 1);
    }

    function handleAudioError(id) {
        console.warn(`Failed to load audio for "${id}".`);
        // Drop the broken element so that a later toggle retries the download.
        audioElements.delete(id);
        state.sounds.get(id).active = false;
        announce(t('soundFailed', { name: soundName(id) }));
        syncPlayback();
        renderMixer();
        scheduleSave();
    }

    /** Audio files are created lazily so that nothing is downloaded until needed. */
    function getAudio(id) {
        let audio = audioElements.get(id);
        if (!audio) {
            const { audio: src } = SOUNDS.find((sound) => sound.id === id);
            audio = new Audio(src);
            audio.loop = true;
            audio.preload = 'auto';
            audio.addEventListener('error', () => handleAudioError(id), { once: true });
            audioElements.set(id, audio);
        }
        return audio;
    }

    function handlePlayRejection(error) {
        // AbortError just means a pause() raced the pending play(); nothing to do.
        if (error.name === 'AbortError') {
            return;
        }
        if (error.name === 'NotAllowedError') {
            // Autoplay was blocked (typically when restoring a session before
            // any user gesture). Fall back to a paused state so that the UI
            // reflects reality and a single click on "Play" resumes the mix.
            if (!state.paused) {
                state.paused = true;
                syncPlayback();
                renderMixer();
            }
            return;
        }
        console.error('Audio playback failed:', error);
    }

    function applyVolumes() {
        for (const [id, audio] of audioElements) {
            audio.volume = effectiveVolume(id);
        }
    }

    /** Reconciles every audio element with the current application state. */
    function syncPlayback() {
        for (const [id, sound] of state.sounds) {
            const shouldPlay = sound.active && !state.paused;

            if (shouldPlay) {
                const audio = getAudio(id);
                audio.volume = effectiveVolume(id);
                if (audio.paused) {
                    audio.play()?.catch(handlePlayRejection);
                }
                continue;
            }

            const audio = audioElements.get(id);
            if (audio && !audio.paused) {
                audio.pause();
            }
            if (audio && !sound.active) {
                audio.currentTime = 0;
            }
        }
        updateMediaSession();
    }

    function updateMediaSession() {
        if (!('mediaSession' in navigator)) {
            return;
        }
        const names = activeIds().map(soundName);
        if (names.length > 0 && typeof window.MediaMetadata === 'function') {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: names.join(' · '),
                artist: t('appTitle')
            });
        }
        navigator.mediaSession.playbackState = isAudible() ? 'playing' : 'paused';
    }

    function registerMediaSessionActions() {
        if (!('mediaSession' in navigator)) {
            return;
        }
        const actions = {
            play: () => setPaused(false),
            pause: () => setPaused(true),
            stop: () => setPaused(true)
        };
        for (const [action, handler] of Object.entries(actions)) {
            try {
                navigator.mediaSession.setActionHandler(action, handler);
            } catch {
                // The action is not supported by this browser; safe to skip.
            }
        }
    }

    /* ---------------------------------------------------------------------
     * Mixer actions
     * ------------------------------------------------------------------ */

    function commitMixerChange() {
        syncPlayback();
        renderMixer();
        scheduleSave();
    }

    function toggleSound(id) {
        const sound = state.sounds.get(id);
        sound.active = !sound.active;
        // Turning a sound on is an explicit request to hear it.
        if (sound.active) {
            state.paused = false;
        }
        commitMixerChange();
    }

    function setSoundVolume(id, value) {
        state.sounds.get(id).volume = toBoundedInt(value, 0, 100, DEFAULT_VOLUME);
        applyVolumes();
        scheduleSave();
    }

    function setMasterVolume(value) {
        state.masterVolume = toBoundedInt(value, 0, 100, 100);
        // Moving the master slider is a clear signal the user wants sound back.
        if (state.muted && state.masterVolume > 0) {
            state.muted = false;
            renderMixer();
        }
        applyVolumes();
        scheduleSave();
    }

    function setPaused(paused) {
        if (state.paused === paused || activeIds().length === 0) {
            return;
        }
        state.paused = paused;
        commitMixerChange();
    }

    function toggleMuted() {
        state.muted = !state.muted;
        applyVolumes();
        renderMixer();
        scheduleSave();
    }

    function clearMix() {
        for (const sound of state.sounds.values()) {
            sound.active = false;
        }
        state.paused = false;
        commitMixerChange();
    }

    /** Replaces the current selection with the given { id: volume } levels. */
    function applyMix(levels) {
        for (const [id, sound] of state.sounds) {
            sound.active = Object.hasOwn(levels, id);
            if (sound.active) {
                sound.volume = levels[id];
            }
        }
        state.paused = false;
        commitMixerChange();
    }

    function shuffleMix() {
        const pool = SOUNDS.map(({ id }) => id);
        const count = 2 + Math.floor(Math.random() * 2);
        const levels = {};
        for (let i = 0; i < count; i += 1) {
            const [id] = pool.splice(Math.floor(Math.random() * pool.length), 1);
            levels[id] = 30 + Math.floor(Math.random() * 11) * 5;
        }
        applyMix(levels);
    }

    function currentLevels() {
        return Object.fromEntries(activeIds().map((id) => [id, state.sounds.get(id).volume]));
    }

    function saveCustomMix(rawName) {
        const name = sanitizeMixName(rawName);
        const levels = currentLevels();
        if (!name || Object.keys(levels).length === 0) {
            return false;
        }

        // Saving under an existing name overwrites that mix.
        const existing = state.customMixes.find((mix) => mix.name === name);
        if (existing) {
            existing.levels = levels;
        } else if (state.customMixes.length >= MAX_CUSTOM_MIXES) {
            announce(t('mixLimit', { n: MAX_CUSTOM_MIXES }));
            return false;
        } else {
            state.customMixes.push({ name, levels });
        }

        announce(t('mixSaved', { name }));
        renderMixList();
        scheduleSave();
        return true;
    }

    function deleteCustomMix(index) {
        const [removed] = state.customMixes.splice(index, 1);
        if (!removed) {
            return;
        }
        announce(t('mixDeleted', { name: removed.name }));
        renderMixList();
        // The chip that held focus is gone; park focus on a stable neighbour.
        dom.saveMixButton.focus();
        scheduleSave();
    }

    /* ---------------------------------------------------------------------
     * Sleep timer
     * ------------------------------------------------------------------ */

    function readTimerMinutes() {
        const minutes = toBoundedInt(dom.minutesInput.value, 1, MAX_TIMER_MIN, null);
        if (minutes !== null) {
            state.timer.minutes = minutes;
            dom.minutesInput.value = String(minutes);
        }
        return minutes;
    }

    function remainingTimerMs() {
        const { targetTime, pausedRemainingMs } = state.timer;
        if (pausedRemainingMs !== null) {
            return pausedRemainingMs;
        }
        return targetTime === null ? 0 : Math.max(0, targetTime - Date.now());
    }

    function stopTicking() {
        window.clearInterval(timerIntervalId);
        timerIntervalId = null;
    }

    function startTicking() {
        stopTicking();
        timerIntervalId = window.setInterval(tickTimer, TIMER_TICK_MS);
        tickTimer();
    }

    function startTimer(minutesOverride = null) {
        const { timer } = state;

        if (minutesOverride === null && timer.pausedRemainingMs !== null) {
            timer.targetTime = Date.now() + timer.pausedRemainingMs;
        } else {
            if (minutesOverride !== null) {
                dom.minutesInput.value = String(minutesOverride);
            }
            const minutes = readTimerMinutes();
            if (minutes === null) {
                dom.minutesInput.focus();
                return;
            }
            timer.targetTime = Date.now() + minutes * 60000;
        }

        timer.pausedRemainingMs = null;
        startTicking();
        renderTimerControls();
        scheduleSave();
    }

    function pauseTimer() {
        const { timer } = state;
        if (timer.targetTime === null) {
            return;
        }
        timer.pausedRemainingMs = Math.max(1, timer.targetTime - Date.now());
        timer.targetTime = null;
        stopTicking();
        // Undo any fade-out that was already in progress.
        applyVolumes();
        renderTimer();
        scheduleSave();
    }

    function resetTimer() {
        state.timer.targetTime = null;
        state.timer.pausedRemainingMs = null;
        stopTicking();
        applyVolumes();
        renderTimer();
        scheduleSave();
    }

    function finishTimer() {
        resetTimer();
        // Keep the selection intact so the same mix is one click away tomorrow.
        state.paused = true;
        commitMixerChange();
        announce(t('timerFinished'));
    }

    function tickTimer() {
        const { targetTime } = state.timer;
        if (targetTime === null) {
            return;
        }

        const remainingMs = targetTime - Date.now();
        if (remainingMs <= 0) {
            finishTimer();
            return;
        }
        if (remainingMs <= FADE_OUT_MS) {
            applyVolumes();
        }
        renderTimerDisplay();
    }

    /* ---------------------------------------------------------------------
     * Rendering
     * ------------------------------------------------------------------ */

    function formatDuration(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const pad = (value) => String(value).padStart(2, '0');

        return hours > 0
            ? `${hours}:${pad(minutes)}:${pad(seconds)}`
            : `${pad(minutes)}:${pad(seconds)}`;
    }

    function renderTimerDisplay() {
        const seconds = Math.ceil(remainingTimerMs() / 1000);
        if (seconds === lastRenderedSeconds) {
            return;
        }
        lastRenderedSeconds = seconds;

        const formatted = formatDuration(seconds);
        dom.timerDisplay.textContent = formatted;
        document.title = seconds > 0 ? `${formatted} - ${t('appTitle')}` : t('appTitle');
    }

    function renderTimerControls() {
        const { targetTime, pausedRemainingMs } = state.timer;
        const isRunning = targetTime !== null;
        const isPaused = pausedRemainingMs !== null;

        dom.timerStart.textContent = t(isPaused ? 'timerResume' : 'timerStart');
        dom.timerPause.disabled = !isRunning;
        dom.timerReset.disabled = !isRunning && !isPaused;
        dom.timerDisplay.classList.toggle('is-paused', isPaused);
    }

    function renderTimer() {
        lastRenderedSeconds = null;
        renderTimerDisplay();
        renderTimerControls();
    }

    function renderMixer() {
        const hasActive = activeIds().length > 0;
        const audible = isAudible();

        for (const [id, card] of cards) {
            const { active, volume } = state.sounds.get(id);
            card.root.classList.toggle('active', active);
            card.toggle.setAttribute('aria-pressed', String(active));
            card.slider.value = String(volume);
        }

        dom.playbackToggle.textContent = t(audible ? 'pause' : 'play');
        dom.playbackToggle.disabled = !hasActive;
        dom.clearMix.disabled = !hasActive;
        dom.saveMixButton.disabled = !hasActive;
        dom.muteToggle.setAttribute('aria-pressed', String(state.muted));
        dom.masterVolume.value = String(state.masterVolume);
        document.body.classList.toggle('is-playing', audible);
    }

    function buildSoundCard({ id, icon }, index) {
        const name = createElement('span', { className: 'sound-name' });
        const toggle = createElement('button', {
            type: 'button',
            className: 'sound-toggle',
            attrs: { 'aria-pressed': 'false' }
        }, [
            createElement('img', {
                className: 'sound-icon',
                src: icon,
                alt: '',
                width: 64,
                height: 64,
                // Icons below the fold do not need to compete with first paint.
                loading: index < 6 ? 'eager' : 'lazy',
                decoding: 'async'
            }),
            name
        ]);
        const slider = createElement('input', {
            type: 'range',
            className: 'volume-slider',
            min: '0',
            max: '100',
            step: '1'
        });
        const root = createElement('div', { className: 'sound-card' }, [
            toggle,
            createElement('div', { className: 'volume-wrapper' }, [slider])
        ]);

        toggle.addEventListener('click', () => toggleSound(id));
        slider.addEventListener('input', () => setSoundVolume(id, slider.value));

        cards.set(id, { root, toggle, slider, name });
        return root;
    }

    function renderSoundLabels() {
        for (const [id, card] of cards) {
            const name = soundName(id);
            card.name.textContent = name;
            card.slider.setAttribute('aria-label', t('volumeOf', { name }));
        }
    }

    function renderTimerPresets() {
        dom.timerPresets.replaceChildren(...TIMER_PRESETS_MIN.map((minutes) => {
            const chip = createElement('button', {
                type: 'button',
                className: 'chip',
                textContent: t('timerPreset', { n: minutes })
            });
            chip.addEventListener('click', () => startTimer(minutes));
            return chip;
        }));
    }

    function renderMixList() {
        const builtIn = BUILT_IN_MIXES.map(({ key, levels }) => {
            const chip = createElement('button', {
                type: 'button',
                className: 'chip',
                textContent: t(key)
            });
            chip.addEventListener('click', () => applyMix(levels));
            return chip;
        });

        const custom = state.customMixes.map(({ name, levels }, index) => {
            // User-provided names are only ever written through textContent.
            const apply = createElement('button', {
                type: 'button',
                className: 'chip chip-custom',
                textContent: name
            });
            const remove = createElement('button', {
                type: 'button',
                className: 'chip chip-remove',
                textContent: '×',
                attrs: { 'aria-label': t('deleteMix', { name }) }
            });
            apply.addEventListener('click', () => applyMix(levels));
            remove.addEventListener('click', () => deleteCustomMix(index));
            return createElement('span', { className: 'chip-group' }, [apply, remove]);
        });

        dom.saveMixButton.textContent = t('saveMix');
        dom.mixList.replaceChildren(...builtIn, ...custom, dom.saveMixButton);
    }

    /** Re-renders every piece of text that depends on the active language. */
    function renderLanguage() {
        applyStaticTranslations();
        dom.languageToggle.textContent = t('switchLanguage');
        renderSoundLabels();
        renderTimerPresets();
        renderMixList();
        renderMixer();
        renderTimer();
        updateMediaSession();
    }

    /* ---------------------------------------------------------------------
     * Event wiring
     * ------------------------------------------------------------------ */

    function setSaveMixFormOpen(open) {
        dom.saveMixForm.hidden = !open;
        if (open) {
            dom.mixNameInput.value = '';
            dom.mixNameInput.focus();
        } else {
            dom.saveMixButton.focus();
        }
    }

    function handleShortcut(event) {
        if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }
        // Never hijack keys from controls that have their own keyboard behaviour.
        if (event.target.closest('input, textarea, select, button, a, [contenteditable]')) {
            return;
        }

        if (event.code === 'Space') {
            event.preventDefault();
            setPaused(!state.paused);
        } else if (event.code === 'KeyM') {
            toggleMuted();
        } else if (/^[0-9]$/.test(event.key)) {
            // Keys 1-9 map to the first nine sounds, 0 to the tenth.
            const sound = SOUNDS[(Number(event.key) + 9) % 10];
            if (sound) {
                toggleSound(sound.id);
            }
        }
    }

    function bindEvents() {
        dom.timerForm.addEventListener('submit', (event) => {
            event.preventDefault();
            startTimer();
        });
        dom.timerPause.addEventListener('click', pauseTimer);
        dom.timerReset.addEventListener('click', resetTimer);
        dom.minutesInput.addEventListener('change', () => {
            if (readTimerMinutes() === null) {
                dom.minutesInput.value = String(state.timer.minutes);
            }
            scheduleSave();
        });

        dom.playbackToggle.addEventListener('click', () => setPaused(!state.paused));
        dom.muteToggle.addEventListener('click', toggleMuted);
        dom.masterVolume.addEventListener('input', () => setMasterVolume(dom.masterVolume.value));
        dom.shuffleMix.addEventListener('click', shuffleMix);
        dom.clearMix.addEventListener('click', clearMix);

        dom.saveMixButton.addEventListener('click', () => setSaveMixFormOpen(true));
        dom.saveMixCancel.addEventListener('click', () => setSaveMixFormOpen(false));
        dom.saveMixForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (saveCustomMix(dom.mixNameInput.value)) {
                setSaveMixFormOpen(false);
            } else {
                dom.mixNameInput.focus();
            }
        });
        dom.saveMixForm.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                setSaveMixFormOpen(false);
            }
        });

        dom.languageToggle.addEventListener('click', () => {
            const index = SUPPORTED_LANGUAGES.indexOf(state.language);
            state.language = SUPPORTED_LANGUAGES[(index + 1) % SUPPORTED_LANGUAGES.length];
            renderLanguage();
            scheduleSave();
        });

        document.addEventListener('keydown', handleShortcut);

        // Background tabs throttle timers, so resynchronise as soon as the page
        // is visible again and make sure nothing is lost when it goes away.
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                flushPendingSave();
            } else {
                tickTimer();
            }
        });
        window.addEventListener('pagehide', flushPendingSave);
    }

    function cacheDom() {
        const ids = [
            'timerDisplay', 'timerForm', 'minutesInput', 'timerStart', 'timerPause',
            'timerReset', 'timerPresets', 'playbackToggle', 'muteToggle', 'masterVolume',
            'shuffleMix', 'clearMix', 'mixList', 'saveMixForm', 'mixNameInput',
            'saveMixCancel', 'soundsGrid', 'languageToggle'
        ];
        for (const id of ids) {
            dom[id] = document.getElementById(id);
        }
        dom.status = document.getElementById('statusRegion');
        dom.saveMixButton = createElement('button', {
            type: 'button',
            className: 'chip chip-action'
        });
    }

    function init() {
        cacheDom();
        restoreState();

        dom.soundsGrid.replaceChildren(...SOUNDS.map(buildSoundCard));
        dom.minutesInput.value = String(state.timer.minutes);

        bindEvents();
        registerMediaSessionActions();
        renderLanguage();

        syncPlayback();
        if (state.timer.targetTime !== null) {
            startTicking();
        }
    }

    init();
})();
