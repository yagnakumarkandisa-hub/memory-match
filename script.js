/**
 * ==============================================================================
 * Memory Match Game - Complete Game Logic (Vanilla JavaScript)
 * File: script.js
 * Description: Powers Solo Casual, Time Attack, Me vs Computer (AI Bot),
 *              Pass & Play Multiplayer, and Real-Time Online WebSocket Multiplayer.
 * ==============================================================================
 */

// --- 1. Sound Synthesis Engine (Web Audio API - Zero External Libraries) ---
class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  playFlip() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch {}
  }

  playMatch() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, index) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        const startTime = this.audioCtx.currentTime + index * 0.08;
        const endTime = startTime + 0.35;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, endTime);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(startTime);
        osc.stop(endTime);
      });
    } catch {}
  }

  playMismatch() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const notes = [329.63, 261.63]; // E4, C4
      notes.forEach((freq, index) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        const startTime = this.audioCtx.currentTime + index * 0.12;
        const endTime = startTime + 0.2;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, endTime);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(startTime);
        osc.stop(endTime);
      });
    } catch {}
  }

  playBonusTime() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const notes = [659.25, 880, 1174.66];
      notes.forEach((freq, index) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        const startTime = this.audioCtx.currentTime + index * 0.06;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch {}
  }

  playClockTick(isUrgent = false) {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(isUrgent ? 1100 : 800, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(isUrgent ? 0.08 : 0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch {}
  }

  playTurnSwitch() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.15);
    } catch {}
  }

  playGameOver() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, this.audioCtx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.6);
    } catch {}
  }

  playVictory() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const fanfare = [
        { f: 523.25, d: 0.12 },
        { f: 659.25, d: 0.12 },
        { f: 783.99, d: 0.12 },
        { f: 1046.5, d: 0.45 },
      ];
      let t = this.audioCtx.currentTime;
      fanfare.forEach((note) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(t);
        osc.stop(t + note.d);
        t += note.d * 0.9;
      });
    } catch {}
  }
}

// --- 2. Confetti Particle System ---
class ConfettiCannon {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animId = null;
    this.defaultColors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#fbbf24'];

    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start(durationMs = 4000, customColors = null) {
    if (!this.canvas || !this.ctx) return;
    this.stop();
    this.particles = [];

    const activeColors = customColors || this.defaultColors;
    const count = 120;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * -this.canvas.height * 0.5,
        w: Math.random() * 9 + 6,
        h: Math.random() * 6 + 4,
        color: activeColors[Math.floor(Math.random() * activeColors.length)],
        vy: Math.random() * 3 + 2.5,
        vx: (Math.random() - 0.5) * 3,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      });
    }

    const startTime = performance.now();
    const render = (now) => {
      const elapsed = now - startTime;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let p of this.particles) {
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.rotSpeed;

        if (elapsed > durationMs - 1000) {
          p.opacity = Math.max(0, 1 - (elapsed - (durationMs - 1000)) / 1000);
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rot * Math.PI) / 180);
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        this.ctx.restore();
      }

      if (elapsed < durationMs) {
        this.animId = requestAnimationFrame(render);
      } else {
        this.stop();
      }
    };

    this.animId = requestAnimationFrame(render);
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.particles = [];
  }
}

// --- 3. Main Game Engine ---
class MemoryGame {
  constructor() {
    this.emojiPool = [
      '🍎', '🚗', '🐱', '🐶', '🍕', '⚽', '🚀', '🌟',
      '🍦', '🎈', '🎸', '🦄', '🍩', '🥑', '🎮', '🌈',
      '💎', '🌮', '🐼', '🌻', '⚡', '👑', '🏀', '🔥',
    ];

    this.difficultyConfigs = {
      easy: { pairs: 4, countdown: 35 },
      medium: { pairs: 8, countdown: 60 },
      hard: { pairs: 12, countdown: 90 },
    };

    // Modes: 'solo' | 'time-attack' | 'bot' | 'multiplayer' | 'online'
    this.currentMode = 'solo';
    this.currentDifficulty = 'medium';
    this.botDifficulty = 'medium'; // 'easy' | 'medium' | 'hard'

    // Board state
    this.cards = [];
    this.firstCard = null;
    this.secondCard = null;
    this.isBoardLocked = false;
    this.matchedPairs = 0;
    this.totalPairs = 8;
    this.isGameActive = false;

    // Solo & Time Attack
    this.moves = 0;
    this.score = 0;
    this.consecutiveMatches = 0;
    this.timerInterval = null;
    this.secondsElapsed = 0;
    this.timeRemaining = 60;

    // Turn-based multiplayer / AI
    this.turnLimitSeconds = 15;
    this.currentTurnTime = 15;
    this.turnTimerInterval = null;
    this.activePlayer = 1; // 1 (Human) or 2 (Opponent / Bot)
    this.players = {
      1: { name: 'Player 1', avatar: '🦊', score: 0, pairs: 0, color: '#06b6d4' },
      2: { name: 'Player 2', avatar: '🐼', score: 0, pairs: 0, color: '#f43f5e' },
    };

    // AI Bot Memory (tracks { [cardIndex]: { emoji, seenTurn } })
    this.botMemory = new Map();
    this.currentTurnCount = 0;

    // WebSocket Online state
    this.ws = null;
    this.onlineRoomId = null;
    this.onlinePlayerIndex = 0; // 0 (P1) or 1 (P2)
    this.isOnlineConnected = false;

    // Audio & Confetti instances
    this.sound = new SoundManager();
    this.confetti = new ConfettiCannon('confetti-canvas');

    this.cacheDomElements();
    this.bindEvents();
    this.initGame();
  }

  cacheDomElements() {
    this.boardEl = document.getElementById('game-board');
    this.timerEl = document.getElementById('timer-display');
    this.timerCardEl = document.getElementById('timer-stat-card');
    this.movesEl = document.getElementById('moves-display');
    this.scoreEl = document.getElementById('score-display');
    this.bestScoreEl = document.getElementById('best-score-display');
    this.bestScoreCardEl = document.getElementById('best-stat-card');
    this.timerLabelEl = document.getElementById('timer-label');
    this.onlineStatusBadge = document.getElementById('online-status-badge');

    this.startBtn = document.getElementById('start-btn');
    this.restartBtn = document.getElementById('restart-btn');
    this.soundBtn = document.getElementById('sound-toggle-btn');
    this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
    this.botDiffBtns = document.querySelectorAll('.bot-diff-btn');
    this.modeBtns = document.querySelectorAll('.mode-btn');

    this.difficultyGroupEl = document.getElementById('difficulty-group');
    this.botDiffGroupEl = document.getElementById('bot-difficulty-group');

    // Multiplayer HUD
    this.multiplayerHudEl = document.getElementById('multiplayer-hud');
    this.p1CardEl = document.getElementById('p1-card');
    this.p2CardEl = document.getElementById('p2-card');
    this.p1NameEl = document.getElementById('p1-name');
    this.p2NameEl = document.getElementById('p2-name');
    this.p1AvatarEl = document.getElementById('p1-avatar');
    this.p2AvatarEl = document.getElementById('p2-avatar');
    this.p1ScoreEl = document.getElementById('p1-score');
    this.p2ScoreEl = document.getElementById('p2-score');
    this.p1PairsEl = document.getElementById('p1-pairs');
    this.p2PairsEl = document.getElementById('p2-pairs');
    this.turnTimerTagEl = document.getElementById('turn-timer-tag');
    this.hudTurnProgressEl = document.getElementById('hud-turn-progress');
    this.turnAnnouncerEl = document.getElementById('turn-announcer');

    // Online Lobby
    this.onlineLobbyPanel = document.getElementById('online-lobby-panel');
    this.quickMatchBtn = document.getElementById('quick-match-btn');
    this.createRoomBtn = document.getElementById('create-room-btn');
    this.joinRoomBtn = document.getElementById('join-room-btn');
    this.roomInput = document.getElementById('room-input');
    this.waitingBanner = document.getElementById('waiting-room-banner');
    this.activeRoomCodeTag = document.getElementById('active-room-code');
    this.onlineEmoteBar = document.getElementById('online-emote-bar');
    this.emoteBtns = document.querySelectorAll('.emote-btn');

    // Modal
    this.modalEl = document.getElementById('victory-modal');
    this.modalTitleEl = document.getElementById('modal-title');
    this.modalSubtitleEl = document.getElementById('modal-subtitle');
    this.modalBadgeEl = document.getElementById('modal-badge');
    this.modalTimeEl = document.getElementById('modal-final-time');
    this.modalMovesEl = document.getElementById('modal-final-moves');
    this.modalScoreEl = document.getElementById('modal-final-score');
    this.modalRecordEl = document.getElementById('modal-record-banner');
    this.modalStatsGridEl = document.getElementById('modal-stats-grid');
    this.starsContainer = document.getElementById('star-rating');
    this.multiplayerWinnerCardEl = document.getElementById('multiplayer-winner-card');
    this.versusP1BoxEl = document.getElementById('versus-p1-box');
    this.versusP2BoxEl = document.getElementById('versus-p2-box');
    this.versusP1NameEl = document.getElementById('versus-p1-name');
    this.versusP2NameEl = document.getElementById('versus-p2-name');
    this.versusP1AvatarEl = document.getElementById('versus-p1-avatar');
    this.versusP2AvatarEl = document.getElementById('versus-p2-avatar');
    this.versusP1ScoreEl = document.getElementById('versus-p1-score');
    this.versusP2ScoreEl = document.getElementById('versus-p2-score');
    this.versusP1PairsEl = document.getElementById('versus-p1-pairs');
    this.versusP2PairsEl = document.getElementById('versus-p2-pairs');
    this.playAgainBtn = document.getElementById('play-again-btn');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
  }

  bindEvents() {
    // Mode Switcher
    this.modeBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const selectedMode = e.currentTarget.getAttribute('data-mode');
        if (selectedMode === this.currentMode) return;

        this.modeBtns.forEach((b) => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        this.currentMode = selectedMode;
        this.sound.init();
        this.handleModeChange();
      });
    });

    // Difficulty
    this.difficultyBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const selectedDifficulty = e.currentTarget.getAttribute('data-difficulty');
        if (selectedDifficulty === this.currentDifficulty) return;

        this.difficultyBtns.forEach((b) => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        this.currentDifficulty = selectedDifficulty;
        this.sound.init();
        this.initGame();
      });
    });

    // Bot Difficulty
    this.botDiffBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const diff = e.currentTarget.getAttribute('data-bot-diff');
        this.botDiffBtns.forEach((b) => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.botDifficulty = diff;
        this.sound.init();
        this.initGame();
      });
    });

    // Start & Restart
    this.startBtn.addEventListener('click', () => {
      this.sound.init();
      if (this.currentMode === 'online') {
        this.connectAndCreateRoom();
      } else {
        this.initGame();
      }
    });

    this.restartBtn.addEventListener('click', () => {
      this.sound.init();
      if (this.currentMode === 'online' && this.onlineRoomId) {
        this.sendWs({ type: 'rematch' });
      } else {
        this.initGame();
      }
    });

    // Sound Toggle
    this.soundBtn.addEventListener('click', () => {
      this.sound.init();
      const isMuted = this.sound.toggleMute();
      this.soundBtn.textContent = isMuted ? '🔇' : '🔊';
      this.soundBtn.setAttribute('title', isMuted ? 'Sound Off (Click to unmute)' : 'Sound On (Click to mute)');
      this.soundBtn.setAttribute('aria-label', isMuted ? 'Unmute audio' : 'Mute audio');
    });

    // Online Lobby Buttons
    this.quickMatchBtn.addEventListener('click', () => {
      this.sound.init();
      this.connectAndQuickMatch();
    });

    this.createRoomBtn.addEventListener('click', () => {
      this.sound.init();
      this.connectAndCreateRoom();
    });

    this.joinRoomBtn.addEventListener('click', () => {
      this.sound.init();
      const code = this.roomInput.value.trim().toUpperCase();
      if (!code) {
        this.showTurnAnnouncement('⚠️ Please enter a 4-letter room code.');
        return;
      }
      this.connectAndJoinRoom(code);
    });

    // Live Emotes
    this.emoteBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const emote = e.currentTarget.textContent.trim();
        this.sendWs({ type: 'send_emote', emote });
        this.renderFloatingReaction(emote);
      });
    });

    // Modal Actions
    this.playAgainBtn.addEventListener('click', () => {
      this.closeModal();
      if (this.currentMode === 'online') {
        this.sendWs({ type: 'rematch' });
      } else {
        this.initGame();
      }
    });

    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener('click', () => this.closeModal());
    }

    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl.classList.contains('active')) {
        this.closeModal();
      } else if (e.key.toLowerCase() === 'r' && !this.modalEl.classList.contains('active')) {
        if (this.currentMode !== 'online') this.initGame();
      }
    });
  }

  handleModeChange() {
    // Show/hide bot difficulty group
    if (this.currentMode === 'bot') {
      this.botDiffGroupEl.style.display = 'flex';
      this.difficultyGroupEl.style.display = 'flex';
    } else {
      this.botDiffGroupEl.style.display = 'none';
      this.difficultyGroupEl.style.display = 'flex';
    }

    // Show/hide online lobby
    if (this.currentMode === 'online') {
      this.onlineLobbyPanel.classList.add('show');
      this.onlineEmoteBar.classList.add('show');
      this.connectWs();
    } else {
      this.onlineLobbyPanel.classList.remove('show');
      this.onlineEmoteBar.classList.remove('show');
      this.waitingBanner.classList.remove('show');
    }

    this.initGame();
  }

  initGame() {
    this.stopTimers();
    document.body.classList.remove('time-critical');
    this.timerCardEl.classList.remove('urgent');

    this.isBoardLocked = false;
    this.isGameActive = false;
    this.firstCard = null;
    this.secondCard = null;
    this.matchedPairs = 0;
    this.consecutiveMatches = 0;
    this.moves = 0;
    this.score = 0;
    this.botMemory.clear();
    this.currentTurnCount = 0;

    const config = this.difficultyConfigs[this.currentDifficulty];
    this.totalPairs = config.pairs;

    // Reset Mode UI
    if (this.currentMode === 'bot') {
      this.multiplayerHudEl.classList.add('active');
      this.timerLabelEl.textContent = 'Turn Timer';
      this.bestScoreCardEl.style.display = 'none';

      // Setup Bot Profile
      const botNames = { easy: 'Rusty the Robot', medium: 'Byte the Bot', hard: 'Nexus 9000' };
      const botAvatars = { easy: '🤖', medium: '🧠', hard: '⚡' };
      this.players[1] = { name: 'You', avatar: '🦊', score: 0, pairs: 0, color: '#06b6d4' };
      this.players[2] = {
        name: botNames[this.botDifficulty],
        avatar: botAvatars[this.botDifficulty],
        score: 0,
        pairs: 0,
        color: '#a855f7',
      };
      this.p2CardEl.className = 'player-card bot-card';

      this.activePlayer = 1;
      this.currentTurnTime = this.turnLimitSeconds;
      this.updateMultiplayerHud();
    } else if (this.currentMode === 'multiplayer') {
      this.multiplayerHudEl.classList.add('active');
      this.timerLabelEl.textContent = 'Turn Timer';
      this.bestScoreCardEl.style.display = 'none';

      this.players[1] = { name: 'Player 1', avatar: '🦊', score: 0, pairs: 0, color: '#06b6d4' };
      this.players[2] = { name: 'Player 2', avatar: '🐼', score: 0, pairs: 0, color: '#f43f5e' };
      this.p2CardEl.className = 'player-card p2-card';

      this.activePlayer = 1;
      this.currentTurnTime = this.turnLimitSeconds;
      this.updateMultiplayerHud();
    } else if (this.currentMode === 'online') {
      this.multiplayerHudEl.classList.add('active');
      this.timerLabelEl.textContent = 'Turn Timer';
      this.bestScoreCardEl.style.display = 'none';
      this.updateMultiplayerHud();
    } else if (this.currentMode === 'time-attack') {
      this.multiplayerHudEl.classList.remove('active');
      this.timerLabelEl.textContent = 'Time Left';
      this.bestScoreCardEl.style.display = 'flex';
      this.timeRemaining = config.countdown;
      this.timerEl.textContent = this.formatTime(this.timeRemaining);
      this.updateBestScoreDisplay();
    } else {
      // Solo
      this.multiplayerHudEl.classList.remove('active');
      this.timerLabelEl.textContent = 'Time';
      this.bestScoreCardEl.style.display = 'flex';
      this.secondsElapsed = 0;
      this.timerEl.textContent = '00:00';
      this.updateBestScoreDisplay();
    }

    this.updateStatsDisplay();

    // Board layout class
    this.boardEl.className = `game-grid ${this.currentDifficulty}`;

    // If not waiting on online server, generate cards locally
    if (this.currentMode !== 'online' || !this.onlineRoomId) {
      this.generateCardsDeck();
      this.renderBoard();
    }
  }

  generateCardsDeck() {
    const shuffledPool = this.shuffleArray([...this.emojiPool]);
    const selectedEmojis = shuffledPool.slice(0, this.totalPairs);
    const cardDeck = [...selectedEmojis, ...selectedEmojis];
    this.cards = this.shuffleArray(cardDeck);
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  renderBoard() {
    this.boardEl.innerHTML = '';

    this.cards.forEach((emoji, index) => {
      const cardEl = document.createElement('div');
      cardEl.classList.add('card');
      cardEl.setAttribute('role', 'button');
      cardEl.setAttribute('tabindex', '0');
      cardEl.setAttribute('aria-label', `Card ${index + 1}, face down`);
      cardEl.dataset.emoji = emoji || '';
      cardEl.dataset.index = index;

      cardEl.innerHTML = `
        <div class="card-inner">
          <div class="card-face card-front">
            <span class="card-pattern-icon">❓</span>
          </div>
          <div class="card-face card-back">
            <span class="card-emoji">${emoji || ''}</span>
          </div>
        </div>
      `;

      cardEl.addEventListener('click', () => this.handleCardClick(cardEl));
      cardEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleCardClick(cardEl);
        }
      });

      this.boardEl.appendChild(cardEl);
    });
  }

  // Handle Card Click
  handleCardClick(cardEl) {
    if (this.isBoardLocked) return;
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

    // In Online mode, relay to server
    if (this.currentMode === 'online') {
      if (this.activePlayer !== this.onlinePlayerIndex + 1) {
        this.showTurnAnnouncement("⏳ Wait for opponent's turn!");
        return;
      }
      this.sendWs({ type: 'flip_card', cardIndex: cardEl.dataset.index });
      return;
    }

    // In Bot mode, human only clicks when activePlayer === 1
    if (this.currentMode === 'bot' && this.activePlayer === 2) {
      return;
    }

    this.sound.init();

    // Start timers on first flip
    if (!this.isGameActive) {
      this.isGameActive = true;
      if (this.currentMode === 'time-attack') {
        this.startTimeAttackTimer();
      } else if (this.currentMode === 'multiplayer' || this.currentMode === 'bot') {
        this.startTurnTimer();
      } else {
        this.startSoloTimer();
      }
    }

    this.flipCard(cardEl);

    // AI bot remembers this revealed card
    this.recordCardToBotMemory(Number(cardEl.dataset.index), cardEl.dataset.emoji);

    if (!this.firstCard) {
      this.firstCard = cardEl;
      return;
    }

    this.secondCard = cardEl;
    this.moves++;
    this.updateStatsDisplay();

    this.checkForMatch();
  }

  flipCard(cardEl) {
    cardEl.classList.add('flipped');
    cardEl.setAttribute('aria-label', `Card ${Number(cardEl.dataset.index) + 1}, ${cardEl.dataset.emoji}`);
    this.sound.playFlip();
  }

  // --- AI Bot Memory & Turn Execution ---
  recordCardToBotMemory(cardIndex, emoji) {
    // Only record if not already matched
    this.botMemory.set(cardIndex, { emoji, seenTurn: this.currentTurnCount });
  }

  triggerBotTurn() {
    if (this.matchedPairs >= this.totalPairs) return;
    this.isBoardLocked = true;
    this.showTurnAnnouncement(`🤖 ${this.players[2].name} is thinking...`);

    // Thinking delay based on difficulty (makes it feel authentic)
    const thinkTime = this.botDifficulty === 'hard' ? 650 : 850;

    setTimeout(() => {
      // 1. Choose First Card
      const firstIndex = this.botChooseCard(null);
      const firstCardEl = this.boardEl.querySelector(`[data-index="${firstIndex}"]`);

      if (!firstCardEl) {
        this.isBoardLocked = false;
        return;
      }

      this.flipCard(firstCardEl);
      this.firstCard = firstCardEl;
      this.recordCardToBotMemory(firstIndex, firstCardEl.dataset.emoji);

      // 2. Pause between flips
      setTimeout(() => {
        const secondIndex = this.botChooseCard(firstIndex);
        const secondCardEl = this.boardEl.querySelector(`[data-index="${secondIndex}"]`);

        if (!secondCardEl) {
          this.isBoardLocked = false;
          return;
        }

        this.flipCard(secondCardEl);
        this.secondCard = secondCardEl;
        this.recordCardToBotMemory(secondIndex, secondCardEl.dataset.emoji);
        this.moves++;
        this.updateStatsDisplay();

        this.checkForMatch();
      }, 700);
    }, thinkTime);
  }

  // Intelligent Bot Decision Making
  botChooseCard(firstChosenIndex) {
    const unrevealedIndices = [];
    const allCards = this.boardEl.querySelectorAll('.card');

    allCards.forEach((c) => {
      const idx = Number(c.dataset.index);
      if (!c.classList.contains('matched') && idx !== firstChosenIndex) {
        unrevealedIndices.push(idx);
      }
    });

    // Check if AI knows a matching pair in memory
    if (firstChosenIndex === null) {
      // Step A: Can Bot see ANY pair in memory?
      if (this.botDifficulty !== 'easy') {
        const memoryEntries = Array.from(this.botMemory.entries()).filter(
          ([idx]) => !allCards[idx].classList.contains('matched')
        );

        // Find pair in memory
        for (let i = 0; i < memoryEntries.length; i++) {
          for (let j = i + 1; j < memoryEntries.length; j++) {
            if (memoryEntries[i][1].emoji === memoryEntries[j][1].emoji) {
              // Retention check based on difficulty
              const recallChance = this.botDifficulty === 'hard' ? 0.95 : 0.65;
              if (Math.random() < recallChance) {
                return memoryEntries[i][0];
              }
            }
          }
        }
      }

      // Pick an unseen card or random
      const unseen = unrevealedIndices.filter((idx) => !this.botMemory.has(idx));
      if (unseen.length > 0) {
        return unseen[Math.floor(Math.random() * unseen.length)];
      }
      return unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
    } else {
      // Step B: Bot chose Card 1; does Bot remember where the twin card is?
      const targetEmoji = allCards[firstChosenIndex].dataset.emoji;

      if (this.botDifficulty !== 'easy') {
        for (let [idx, data] of this.botMemory.entries()) {
          if (idx !== firstChosenIndex && data.emoji === targetEmoji && !allCards[idx].classList.contains('matched')) {
            const recallChance = this.botDifficulty === 'hard' ? 0.98 : 0.75;
            if (Math.random() < recallChance) {
              return idx;
            }
          }
        }
      }

      // Fallback: pick unknown card
      const candidates = unrevealedIndices.filter((idx) => idx !== firstChosenIndex);
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
  }

  // Evaluate Match
  checkForMatch() {
    const isMatch = this.firstCard.dataset.emoji === this.secondCard.dataset.emoji;

    if (isMatch) {
      this.handleMatchSuccess();
    } else {
      this.handleMatchFailure();
    }
  }

  handleMatchSuccess() {
    this.isBoardLocked = true;
    this.consecutiveMatches++;

    const comboBonus = (this.consecutiveMatches - 1) * 25;
    const pointsAwarded = 100 + comboBonus;

    if (this.currentMode === 'multiplayer' || this.currentMode === 'bot') {
      this.players[this.activePlayer].score += pointsAwarded;
      this.players[this.activePlayer].pairs++;
      this.updateMultiplayerHud();
    } else {
      this.score += pointsAwarded;
      this.updateStatsDisplay();
    }

    if (this.currentMode === 'time-attack') {
      this.addBonusTime(5);
    }

    setTimeout(() => {
      this.firstCard.classList.add('matched');
      this.secondCard.classList.add('matched');

      // Card border color matches player
      if (this.currentMode === 'multiplayer') {
        const pClass = this.activePlayer === 1 ? 'p1-matched' : 'p2-matched';
        this.firstCard.classList.add(pClass);
        this.secondCard.classList.add(pClass);
      } else if (this.currentMode === 'bot') {
        const pClass = this.activePlayer === 1 ? 'p1-matched' : 'bot-matched';
        this.firstCard.classList.add(pClass);
        this.secondCard.classList.add(pClass);
      }

      this.sound.playMatch();
      this.matchedPairs++;

      // Clean memory of matched cards
      const idx1 = Number(this.firstCard.dataset.index);
      const idx2 = Number(this.secondCard.dataset.index);
      this.botMemory.delete(idx1);
      this.botMemory.delete(idx2);

      const isWon = this.matchedPairs === this.totalPairs;

      if ((this.currentMode === 'multiplayer' || this.currentMode === 'bot') && !isWon) {
        this.showTurnAnnouncement(`🌟 ${this.players[this.activePlayer].name}: Bonus Turn!`);
        this.resetTurnTimer();
      }

      this.resetSelection();

      if (isWon) {
        this.handleGameVictory();
      } else if (this.currentMode === 'bot' && this.activePlayer === 2) {
        // AI gets bonus turn!
        this.triggerBotTurn();
      }
    }, 250);
  }

  handleMatchFailure() {
    this.isBoardLocked = true;
    this.consecutiveMatches = 0;

    if (this.currentMode !== 'multiplayer' && this.currentMode !== 'bot') {
      this.score = Math.max(0, this.score - 10);
      this.updateStatsDisplay();
    }

    setTimeout(() => {
      this.sound.playMismatch();
      this.firstCard.classList.add('unmatched');
      this.secondCard.classList.add('unmatched');
    }, 320);

    setTimeout(() => {
      if (this.firstCard && this.secondCard) {
        this.firstCard.classList.remove('flipped', 'unmatched');
        this.secondCard.classList.remove('flipped', 'unmatched');
      }
      this.resetSelection();

      // Switch turn
      if (this.currentMode === 'multiplayer' || this.currentMode === 'bot') {
        this.switchPlayerTurn();
      }
    }, 950);
  }

  resetSelection() {
    this.firstCard = null;
    this.secondCard = null;
    this.isBoardLocked = false;
  }

  // --- Turn Logic ---
  switchPlayerTurn() {
    this.activePlayer = this.activePlayer === 1 ? 2 : 1;
    this.currentTurnCount++;
    this.sound.playTurnSwitch();
    this.showTurnAnnouncement(`👉 ${this.players[this.activePlayer].name}'s Turn!`);
    this.resetTurnTimer();
    this.updateMultiplayerHud();

    // If bot's turn, trigger bot thinking
    if (this.currentMode === 'bot' && this.activePlayer === 2) {
      this.triggerBotTurn();
    }
  }

  showTurnAnnouncement(message) {
    if (!this.turnAnnouncerEl) return;
    this.turnAnnouncerEl.textContent = message;
    this.turnAnnouncerEl.classList.add('show');
    setTimeout(() => {
      this.turnAnnouncerEl.classList.remove('show');
    }, 1800);
  }

  updateMultiplayerHud() {
    this.p1NameEl.textContent = this.players[1].name;
    this.p2NameEl.textContent = this.players[2].name;
    this.p1AvatarEl.textContent = this.players[1].avatar;
    this.p2AvatarEl.textContent = this.players[2].avatar;

    this.p1ScoreEl.textContent = this.players[1].score;
    this.p2ScoreEl.textContent = this.players[2].score;
    this.p1PairsEl.textContent = this.players[1].pairs;
    this.p2PairsEl.textContent = this.players[2].pairs;

    if (this.activePlayer === 1) {
      this.p1CardEl.classList.add('active');
      this.p2CardEl.classList.remove('active');
    } else {
      this.p1CardEl.classList.remove('active');
      this.p2CardEl.classList.add('active');
    }
  }

  startTurnTimer() {
    this.stopTimers();
    this.currentTurnTime = this.turnLimitSeconds;
    this.updateTurnTimerUI();

    this.turnTimerInterval = setInterval(() => {
      this.currentTurnTime--;
      this.updateTurnTimerUI();

      if (this.currentTurnTime <= 3 && this.currentTurnTime > 0) {
        this.sound.playClockTick(true);
      }

      if (this.currentTurnTime <= 0) {
        if (this.firstCard) {
          this.firstCard.classList.remove('flipped');
          this.firstCard = null;
        }
        this.switchPlayerTurn();
      }
    }, 1000);
  }

  resetTurnTimer() {
    if (this.currentMode !== 'multiplayer' && this.currentMode !== 'bot') return;
    this.currentTurnTime = this.turnLimitSeconds;
    this.updateTurnTimerUI();
  }

  updateTurnTimerUI() {
    if (this.turnTimerTagEl) {
      this.turnTimerTagEl.textContent = `${this.currentTurnTime}s`;
    }
    if (this.timerEl && (this.currentMode === 'multiplayer' || this.currentMode === 'bot')) {
      this.timerEl.textContent = `${this.currentTurnTime}s`;
    }
    if (this.hudTurnProgressEl) {
      const percentage = (this.currentTurnTime / this.turnLimitSeconds) * 100;
      this.hudTurnProgressEl.style.transform = `scaleX(${percentage / 100})`;
    }
  }

  // --- Solo Timers ---
  startSoloTimer() {
    this.stopTimers();
    this.secondsElapsed = 0;
    this.timerInterval = setInterval(() => {
      this.secondsElapsed++;
      this.timerEl.textContent = this.formatTime(this.secondsElapsed);
    }, 1000);
  }

  startTimeAttackTimer() {
    this.stopTimers();
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      this.timerEl.textContent = this.formatTime(this.timeRemaining);

      if (this.timeRemaining <= 10 && this.timeRemaining > 0) {
        document.body.classList.add('time-critical');
        this.timerCardEl.classList.add('urgent');
        this.sound.playClockTick(true);
      } else {
        document.body.classList.remove('time-critical');
        this.timerCardEl.classList.remove('urgent');
      }

      if (this.timeRemaining <= 0) {
        this.handleTimeAttackDefeat();
      }
    }, 1000);
  }

  addBonusTime(seconds = 5) {
    this.timeRemaining += seconds;
    this.timerEl.textContent = this.formatTime(this.timeRemaining);
    this.sound.playBonusTime();

    const badge = document.createElement('div');
    badge.className = 'bonus-float';
    badge.textContent = `+${seconds}s Bonus!`;
    this.timerCardEl.appendChild(badge);

    setTimeout(() => {
      if (badge && badge.parentNode) badge.parentNode.removeChild(badge);
    }, 1200);

    if (this.timeRemaining > 10) {
      document.body.classList.remove('time-critical');
      this.timerCardEl.classList.remove('urgent');
    }
  }

  stopTimers() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.turnTimerInterval) {
      clearInterval(this.turnTimerInterval);
      this.turnTimerInterval = null;
    }
  }

  formatTime(totalSeconds) {
    const minutes = Math.floor(Math.max(0, totalSeconds) / 60);
    const seconds = Math.max(0, totalSeconds) % 60;
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  updateStatsDisplay() {
    this.movesEl.textContent = this.moves;
    this.scoreEl.textContent = this.score;
  }

  // --- Real-Time Online WebSocket Client ---
  connectWs(callback) {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      if (callback && this.ws.readyState === WebSocket.OPEN) callback();
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    this.onlineStatusBadge.textContent = '🟡 Connecting...';
    this.onlineStatusBadge.className = 'online-status-badge connecting';

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isOnlineConnected = true;
        this.onlineStatusBadge.textContent = '🟢 Online Server Ready';
        this.onlineStatusBadge.className = 'online-status-badge';
        if (callback) callback();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleWsMessage(msg);
        } catch {}
      };

      this.ws.onclose = () => {
        this.isOnlineConnected = false;
        this.onlineStatusBadge.textContent = '🔴 Offline';
        this.onlineStatusBadge.className = 'online-status-badge connecting';
      };
    } catch {
      this.onlineStatusBadge.textContent = '🔴 Offline';
    }
  }

  sendWs(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  connectAndQuickMatch() {
    this.connectWs(() => {
      this.sendWs({
        type: 'quick_match',
        playerName: 'You',
        difficulty: this.currentDifficulty,
      });
      this.showTurnAnnouncement('🔍 Finding an opponent...');
    });
  }

  connectAndCreateRoom() {
    this.connectWs(() => {
      this.sendWs({
        type: 'create_room',
        playerName: 'Player 1',
        difficulty: this.currentDifficulty,
      });
    });
  }

  connectAndJoinRoom(roomId) {
    this.connectWs(() => {
      this.sendWs({
        type: 'join_room',
        roomId,
        playerName: 'Player 2',
      });
    });
  }

  handleWsMessage(msg) {
    switch (msg.type) {
      case 'room_created':
        this.onlineRoomId = msg.roomId;
        this.onlinePlayerIndex = 0;
        this.activeRoomCodeTag.textContent = msg.roomId;
        this.waitingBanner.classList.add('show');
        this.showTurnAnnouncement(`Room Created! Share code: ${msg.roomId}`);
        break;

      case 'game_start':
        this.waitingBanner.classList.remove('show');
        this.onlineRoomId = msg.roomId;
        this.totalPairs = msg.cardCount / 2;
        this.currentDifficulty = msg.difficulty;
        this.boardEl.className = `game-grid ${msg.difficulty}`;

        // Populate empty cards
        this.cards = new Array(msg.cardCount).fill('');
        this.renderBoard();

        // Update players
        this.players[1] = {
          name: msg.players[0].name,
          avatar: msg.players[0].avatar,
          score: msg.players[0].score,
          pairs: msg.players[0].pairs,
        };
        this.players[2] = {
          name: msg.players[1].name,
          avatar: msg.players[1].avatar,
          score: msg.players[1].score,
          pairs: msg.players[1].pairs,
        };
        this.activePlayer = msg.turnIndex + 1;
        this.updateMultiplayerHud();

        const isMyTurn = this.activePlayer === this.onlinePlayerIndex + 1;
        this.showTurnAnnouncement(isMyTurn ? "🎮 Game Started! It's YOUR turn!" : "🎮 Game Started! Opponent's turn!");
        break;

      case 'card_revealed': {
        const cardEl = this.boardEl.querySelector(`[data-index="${msg.cardIndex}"]`);
        if (cardEl) {
          cardEl.dataset.emoji = msg.emoji;
          cardEl.querySelector('.card-emoji').textContent = msg.emoji;
          this.flipCard(cardEl);
        }
        break;
      }

      case 'match_result':
        if (msg.isMatch) {
          msg.indices.forEach((idx) => {
            const cardEl = this.boardEl.querySelector(`[data-index="${idx}"]`);
            if (cardEl) {
              cardEl.classList.add('matched');
              cardEl.classList.add(msg.turnIndex === 0 ? 'p1-matched' : 'p2-matched');
            }
          });
          this.sound.playMatch();
          this.players[1].score = msg.players[0].score;
          this.players[1].pairs = msg.players[0].pairs;
          this.players[2].score = msg.players[1].score;
          this.players[2].pairs = msg.players[1].pairs;
          this.updateMultiplayerHud();

          if (msg.bonusTurn) {
            this.showTurnAnnouncement(`🌟 ${this.players[msg.turnIndex + 1].name}: Bonus Turn!`);
          }
        } else {
          this.sound.playMismatch();
          msg.indices.forEach((idx) => {
            const cardEl = this.boardEl.querySelector(`[data-index="${idx}"]`);
            if (cardEl) cardEl.classList.add('unmatched');
          });

          setTimeout(() => {
            msg.indices.forEach((idx) => {
              const cardEl = this.boardEl.querySelector(`[data-index="${idx}"]`);
              if (cardEl) cardEl.classList.remove('flipped', 'unmatched');
            });
            this.activePlayer = msg.nextTurnIndex + 1;
            this.updateMultiplayerHud();
            this.sound.playTurnSwitch();
            const isMyTurn = this.activePlayer === this.onlinePlayerIndex + 1;
            this.showTurnAnnouncement(isMyTurn ? '👉 Your Turn!' : "👉 Opponent's Turn!");
          }, 850);
        }
        break;

      case 'turn_tick':
        this.currentTurnTime = msg.timeLeft;
        this.updateTurnTimerUI();
        break;

      case 'turn_timeout':
        if (msg.resetCardIndex !== null) {
          const cardEl = this.boardEl.querySelector(`[data-index="${msg.resetCardIndex}"]`);
          if (cardEl) cardEl.classList.remove('flipped');
        }
        this.activePlayer = msg.nextTurnIndex + 1;
        this.updateMultiplayerHud();
        this.sound.playTurnSwitch();
        this.showTurnAnnouncement(`⏰ Time Expired! ${this.players[this.activePlayer].name}'s Turn!`);
        break;

      case 'emote_received':
        this.renderFloatingReaction(msg.emote);
        break;

      case 'opponent_disconnected':
        this.showTurnAnnouncement('⚠️ Opponent disconnected.');
        break;

      case 'game_over':
        this.showOnlineGameOver(msg);
        break;

      case 'error':
        this.showTurnAnnouncement(`❌ ${msg.message}`);
        break;
    }
  }

  renderFloatingReaction(emote) {
    const el = document.createElement('div');
    el.className = 'floating-reaction';
    el.textContent = emote;
    document.body.appendChild(el);
    setTimeout(() => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 2200);
  }

  showOnlineGameOver(msg) {
    this.sound.playVictory();
    let winnerText = '';

    if (msg.winnerIndex === this.onlinePlayerIndex) {
      winnerText = '🏆 You Won!';
      this.confetti.start(4500, ['#10b981', '#34d399', '#ffffff']);
    } else if (msg.winnerIndex === -1) {
      winnerText = "🤝 It's a Tie!";
      this.confetti.start(4500);
    } else {
      winnerText = '🥈 Opponent Won!';
    }

    this.modalBadgeEl.textContent = '🎉';
    this.modalTitleEl.textContent = winnerText;
    this.modalSubtitleEl.textContent = 'Great online match! Thank you for playing.';

    this.starsContainer.style.display = 'none';
    this.modalRecordEl.classList.remove('show');
    this.modalStatsGridEl.style.display = 'none';
    this.multiplayerWinnerCardEl.classList.add('show');

    this.versusP1NameEl.textContent = msg.p1.name;
    this.versusP2NameEl.textContent = msg.p2.name;
    this.versusP1AvatarEl.textContent = msg.p1.avatar;
    this.versusP2AvatarEl.textContent = msg.p2.avatar;
    this.versusP1ScoreEl.textContent = msg.p1.score;
    this.versusP2ScoreEl.textContent = msg.p2.score;
    this.versusP1PairsEl.textContent = `${msg.p1.pairs} pairs`;
    this.versusP2PairsEl.textContent = `${msg.p2.pairs} pairs`;

    this.playAgainBtn.innerHTML = '<span>⚔️</span> Rematch';
    this.modalEl.classList.add('active');
  }

  // --- Victory & Game Over Modals ---
  handleGameVictory() {
    this.stopTimers();
    document.body.classList.remove('time-critical');
    this.timerCardEl.classList.remove('urgent');

    this.sound.playVictory();

    if (this.currentMode === 'multiplayer' || this.currentMode === 'bot') {
      this.showMultiplayerVictory();
    } else {
      this.showSoloVictory();
    }
  }

  handleTimeAttackDefeat() {
    this.stopTimers();
    this.isBoardLocked = true;
    document.body.classList.remove('time-critical');
    this.timerCardEl.classList.remove('urgent');

    this.sound.playGameOver();

    this.modalBadgeEl.textContent = '⏰';
    this.modalTitleEl.textContent = "Time's Up!";
    this.modalSubtitleEl.textContent = `You found ${this.matchedPairs} of ${this.totalPairs} pairs before the clock ran out!`;

    this.starsContainer.style.display = 'none';
    this.modalRecordEl.classList.remove('show');
    this.multiplayerWinnerCardEl.classList.remove('show');
    this.modalStatsGridEl.style.display = 'grid';

    this.modalTimeEl.textContent = '00:00';
    this.modalMovesEl.textContent = this.moves;
    this.modalScoreEl.textContent = this.score;

    this.playAgainBtn.innerHTML = '<span>🔄</span> Try Again';
    this.modalEl.classList.add('active');
  }

  showSoloVictory() {
    if (this.currentMode === 'time-attack') {
      this.score += this.timeRemaining * 10;
    } else {
      const timeBonus = Math.max(0, Math.floor((this.totalPairs * 20 - this.secondsElapsed) * 5));
      this.score += timeBonus;
    }
    this.updateStatsDisplay();

    this.confetti.start(4500);
    const isNewRecord = this.saveHighScore();

    this.modalBadgeEl.textContent = '🎉';
    this.modalTitleEl.textContent = 'Victory!';
    this.modalSubtitleEl.textContent = 'Congratulations! You matched all pairs!';

    this.starsContainer.style.display = 'flex';
    this.multiplayerWinnerCardEl.classList.remove('show');
    this.modalStatsGridEl.style.display = 'grid';

    const efficiency = this.totalPairs / this.moves;
    let starCount = 1;
    if (efficiency >= 0.75) starCount = 3;
    else if (efficiency >= 0.5) starCount = 2;

    this.starsContainer.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const starSpan = document.createElement('span');
      starSpan.className = `star ${i <= starCount ? 'active' : ''}`;
      starSpan.textContent = '★';
      this.starsContainer.appendChild(starSpan);
    }

    if (isNewRecord) {
      this.modalRecordEl.classList.add('show');
    } else {
      this.modalRecordEl.classList.remove('show');
    }

    this.modalTimeEl.textContent =
      this.currentMode === 'time-attack'
        ? `${this.difficultyConfigs[this.currentDifficulty].countdown - this.timeRemaining}s`
        : this.formatTime(this.secondsElapsed);

    this.modalMovesEl.textContent = this.moves;
    this.modalScoreEl.textContent = this.score;

    this.playAgainBtn.innerHTML = '<span>🎮</span> Play Again';
    this.modalEl.classList.add('active');
  }

  showMultiplayerVictory() {
    const p1 = this.players[1];
    const p2 = this.players[2];

    let winnerText = '';
    let confettiColors = null;

    if (p1.score > p2.score) {
      winnerText = `🏆 ${p1.name} Wins!`;
      this.modalBadgeEl.textContent = p1.avatar;
      this.versusP1BoxEl.classList.add('winner');
      this.versusP2BoxEl.classList.remove('winner');
      confettiColors = ['#06b6d4', '#38bdf8', '#bae6fd', '#ffffff'];
    } else if (p2.score > p1.score) {
      winnerText = `🏆 ${p2.name} Wins!`;
      this.modalBadgeEl.textContent = p2.avatar;
      this.versusP2BoxEl.classList.add('winner');
      this.versusP1BoxEl.classList.remove('winner');
      confettiColors = ['#f43f5e', '#fb7185', '#fecdd3', '#ffffff'];
    } else {
      winnerText = "🤝 It's a Tie!";
      this.modalBadgeEl.textContent = '🤝';
      this.versusP1BoxEl.classList.remove('winner');
      this.versusP2BoxEl.classList.remove('winner');
      confettiColors = ['#06b6d4', '#f43f5e', '#fbbf24', '#ffffff'];
    }

    this.confetti.start(4500, confettiColors);

    this.modalTitleEl.textContent = winnerText;
    this.modalSubtitleEl.textContent = `Brilliant match!`;

    this.starsContainer.style.display = 'none';
    this.modalRecordEl.classList.remove('show');
    this.modalStatsGridEl.style.display = 'none';
    this.multiplayerWinnerCardEl.classList.add('show');

    this.versusP1NameEl.textContent = p1.name;
    this.versusP2NameEl.textContent = p2.name;
    this.versusP1AvatarEl.textContent = p1.avatar;
    this.versusP2AvatarEl.textContent = p2.avatar;
    this.versusP1ScoreEl.textContent = p1.score;
    this.versusP2ScoreEl.textContent = p2.score;
    this.versusP1PairsEl.textContent = `${p1.pairs} pairs`;
    this.versusP2PairsEl.textContent = `${p2.pairs} pairs`;

    this.playAgainBtn.innerHTML = '<span>⚔️</span> Play Rematch';
    this.modalEl.classList.add('active');
  }

  saveHighScore() {
    const storageKey = `memory_match_best_${this.currentMode}_${this.currentDifficulty}`;
    const previousBest = localStorage.getItem(storageKey);

    let isNewRecord = false;
    if (!previousBest || this.score > Number(previousBest)) {
      localStorage.setItem(storageKey, this.score);
      isNewRecord = true;
      this.updateBestScoreDisplay();
    }
    return isNewRecord;
  }

  updateBestScoreDisplay() {
    const storageKey = `memory_match_best_${this.currentMode}_${this.currentDifficulty}`;
    const best = localStorage.getItem(storageKey);
    this.bestScoreEl.textContent = best ? best : '-';
  }

  closeModal() {
    this.modalEl.classList.remove('active');
    this.confetti.stop();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.memoryGame = new MemoryGame();
});
