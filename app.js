// Super Goal 3 Master Interactive Learning & Certification Platform Engine
// Course: Unit 1 - Lifestyles (Intermediate Third Grade - Term 1)
// Supervising Instructor: Teacher Mahmoud Al-Saeed
// Invariant: 100% Target Language Immersion (English)
// Audio: Deepgram American Natural Voice Engine + Synchronized Read-Along Highlighting

document.addEventListener('DOMContentLoaded', () => {
  const DATA = window.APP_DATA;
  if (!DATA) {
    console.error('APP_DATA not found. Please ensure data.js is loaded.');
    return;
  }

  // Clean legacy Super Goal 2 storage to ensure clean 0 XP start for Super Goal 3
  try {
    if (localStorage.getItem('sg2_student_xp')) localStorage.removeItem('sg2_student_xp');
    if (localStorage.getItem('sg2_student_name')) localStorage.removeItem('sg2_student_name');
    if (localStorage.getItem('sg2_student_school')) localStorage.removeItem('sg2_student_school');
  } catch (e) {}

  // Application State
  const state = {
    currentTab: 'overview',
    studentName: localStorage.getItem('sg3_student_name') || '',
    studentSchool: localStorage.getItem('sg3_student_school') || '',
    studentXP: parseInt(localStorage.getItem('sg3_student_xp') || '0', 10),
    deepgramApiKey: localStorage.getItem('deepgram_api_key') || '',
    deepgramVoice: localStorage.getItem('deepgram_voice') || 'aura-asteria-en', // Natural American Voice
    speechRate: parseFloat(localStorage.getItem('preferred_speech_rate')) || 1.0,
    readingSentenceIndex: 0,
    readingAnimationTimer: null,
    sentenceStepTimer: null,
    sentenceSafetyTimer: null,
    currentUtterance: null,
    audioCache: {},
    currentAudioObject: null,
    isReadingPlaying: false,
    readingHighlightInterval: null,
    selectedUnit: 'all', // 'all', 1, or 2
    grammarFilter: 'all', // 'all', 1, or 2
    pronunciationFilter: 'all', // 'all', 1, or 2
    discussionFilter: 'all', // 'all', 1, or 2
    vocabFilter: 'all',
    examFilter: 'all',
    vocabSearch: '',
    vocabFlashcardIndex: 0,
    filteredVocab: [...DATA.vocabulary],
    activeExam: null,
    examMode: 'timed', // 'timed' or 'practice'
    examCurrentQuestionIndex: 0,
    examUserAnswers: {},
    examTimerInterval: null,
    examSecondsRemaining: 0,
    examTotalDuration: 0,
    examStreak: 0,
    examBestStreak: 0,
    examEncouragements: {},
    currentReadingStoryId: 'u1_reading_lifestyles',
    currentWritingTaskId: 'u1_w1',
    currentDiscussionId: 'u1_d1',
    theme: localStorage.getItem('sg3_theme') || 'light'
  };

  // Sound Synthesizer via Web Audio API (Chimes, Clicks & Exam Feedback)
  function playSound(type) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.09); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
        osc.start();
        osc.stop(ctx.currentTime + 0.32);
      } else if (type === 'incorrect') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
        osc.frequency.setValueAtTime(196.00, ctx.currentTime + 0.11); // G3
        gain.gain.setValueAtTime(0.13, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
        osc.start();
        osc.stop(ctx.currentTime + 0.32);
      } else if (type === 'streak') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (type === 'click') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch (e) {
      // AudioContext muted/unsupported
    }
  }

  // Visualizer Animation Toggle
  function setEqualizerAnimating(isAnimating) {
    document.querySelectorAll('.wave-bar').forEach(bar => {
      bar.classList.toggle('animating', isAnimating);
    });
  }

  // Fetch Audio from Deepgram API
  async function fetchDeepgramAudio(text, voiceModel) {
    const apiKey = state.deepgramApiKey.trim();
    if (!apiKey) return null;
    const cacheKey = `${voiceModel}_${text}`;
    if (state.audioCache[cacheKey]) return state.audioCache[cacheKey];

    try {
      const res = await fetch(`https://api.deepgram.com/v1/speak?model=${encodeURIComponent(voiceModel)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });
      if (!res.ok) {
        console.warn(`Deepgram API status ${res.status}`);
        return null;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      state.audioCache[cacheKey] = url;
      return url;
    } catch (err) {
      console.warn('Deepgram fetch error, using natural American voice fallback:', err);
      return null;
    }
  }

  // Get Best Available American English Voice
  function getBestAmericanVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    // Prioritize high-quality American English natural voices
    const preferredNames = [
      'Google US English',
      'Microsoft Jenny Online (Natural) - English (United States)',
      'Microsoft Guy Online (Natural) - English (United States)',
      'Microsoft Aria Online (Natural)',
      'Samantha',
      'Alex',
      'Zira'
    ];
    for (const name of preferredNames) {
      const v = voices.find(voice => voice.name.includes(name) || (voice.lang === 'en-US' && voice.name.toLowerCase().includes(name.toLowerCase())));
      if (v) return v;
    }
    // Fallback to any en-US voice
    return voices.find(v => v.lang === 'en-US' || v.lang === 'en_US') || null;
  }

  // Pre-load speech synthesis voices
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      getBestAmericanVoice();
    };
  }

  // Stop any active speech/audio playback
  function stopCurrentAudio() {
    if (state.currentAudioObject) {
      state.currentAudioObject.pause();
      state.currentAudioObject = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (state.readingHighlightInterval) {
      clearInterval(state.readingHighlightInterval);
      state.readingHighlightInterval = null;
    }
    if (state.readingAnimationTimer) {
      cancelAnimationFrame(state.readingAnimationTimer);
      state.readingAnimationTimer = null;
    }
    if (state.sentenceStepTimer) {
      cancelAnimationFrame(state.sentenceStepTimer);
      state.sentenceStepTimer = null;
    }
    if (state.sentenceSafetyTimer) {
      clearTimeout(state.sentenceSafetyTimer);
      state.sentenceSafetyTimer = null;
    }
    state.isReadingPlaying = false;
    setEqualizerAnimating(false);
    clearAllReadingHighlights();
    const playBtn = document.getElementById('playHighlightBtn');
    if (playBtn) playBtn.innerHTML = '▶ Read with Live Highlighting';
  }
  window.stopCurrentAudio = stopCurrentAudio;

  // Universal Speech Function (Deepgram American Voice or Enhanced American Fallback)
  async function speakText(text) {
    stopCurrentAudio();
    setEqualizerAnimating(true);
    addXP(5);

    // 1. Try Deepgram if API key is provided
    if (state.deepgramApiKey) {
      const audioUrl = await fetchDeepgramAudio(text, state.deepgramVoice);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        state.currentAudioObject = audio;
        audio.playbackRate = state.speechRate;
        audio.preservesPitch = true;
        audio.onended = () => {
          setEqualizerAnimating(false);
          state.currentAudioObject = null;
        };
        audio.onerror = () => {
          setEqualizerAnimating(false);
          fallbackAmericanSpeech(text);
        };
        audio.play().catch(() => fallbackAmericanSpeech(text));
        return;
      }
    }

    // 2. Fallback to Natural American Native Voice
    fallbackAmericanSpeech(text);
  }
  window.speakText = speakText;

  function fallbackAmericanSpeech(text, onBoundaryCallback, onEndCallback) {
    if (!('speechSynthesis' in window)) {
      setEqualizerAnimating(false);
      return;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    const utterance = new SpeechSynthesisUtterance(text);
    const usVoice = getBestAmericanVoice();
    if (usVoice) utterance.voice = usVoice;
    utterance.lang = 'en-US';
    utterance.rate = state.speechRate;
    utterance.pitch = 1.0;

    if (onBoundaryCallback) {
      utterance.onboundary = onBoundaryCallback;
    }

    utterance.onend = () => {
      setEqualizerAnimating(false);
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      setEqualizerAnimating(false);
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  }

  // ==========================================================================
  // TOP MOVING STAR STUDENT HONOR BAR (Passes every 5 minutes)
  // ==========================================================================
  let tickerCountdownSeconds = 300; // 5 minutes = 300 seconds
  let tickerIntervalTimer = null;
  let isTickerPassing = false;

  function updateTickerContent() {
    const nameElem = document.getElementById('tickerStudentName');
    const xpElem = document.getElementById('tickerStudentXP');
    const hasName = state.studentName && state.studentName.trim().length > 0;
    const displayName = hasName ? state.studentName.trim() : 'Student of Distinction';

    if (nameElem) nameElem.textContent = displayName;
    if (xpElem) xpElem.textContent = state.studentXP.toString();
  }

  function launchTickerPass() {
    const track = document.getElementById('starStudentTrack');
    if (!track) return;

    updateTickerContent();

    // Trigger CSS animation cleanly
    track.classList.remove('passing');
    void track.offsetWidth; // Force reflow
    track.classList.add('passing');
    isTickerPassing = true;

    // Reset 5-minute countdown clock
    tickerCountdownSeconds = 300;
    updateTickerCountdownDisplay();

    try {
      playSound('pop');
    } catch(e) {}
  }

  function updateTickerCountdownDisplay() {
    const countdownElem = document.getElementById('tickerTimerCountdown');
    if (!countdownElem) return;
    const mins = Math.floor(tickerCountdownSeconds / 60);
    const secs = tickerCountdownSeconds % 60;
    countdownElem.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function initStarStudentTicker() {
    updateTickerContent();

    const track = document.getElementById('starStudentTrack');
    if (track) {
      track.addEventListener('animationend', () => {
        track.classList.remove('passing');
        isTickerPassing = false;
      });
    }

    const pill = document.getElementById('tickerTimerPill');
    if (pill) {
      pill.addEventListener('click', () => {
        launchTickerPass();
      });
    }

    // Launch immediate celebratory pass on load so user sees it right away
    setTimeout(() => {
      launchTickerPass();
    }, 1200);

    // 5-Minute Timer (checks every second)
    if (tickerIntervalTimer) clearInterval(tickerIntervalTimer);
    tickerIntervalTimer = setInterval(() => {
      if (tickerCountdownSeconds > 0) {
        tickerCountdownSeconds--;
        updateTickerCountdownDisplay();
      } else {
        // 5 minutes reached: Launch pass!
        launchTickerPass();
      }
    }, 1000);
  }

  // Gamification XP Addition
  function addXP(points) {
    state.studentXP += points;
    localStorage.setItem('sg3_student_xp', state.studentXP.toString());
    const xpElem = document.getElementById('studentXPDisplay');
    if (xpElem) {
      xpElem.textContent = state.studentXP.toString();
    }
    updateTickerContent();
  }

  // Student Passport Initialization & Sync
  function syncStudentPassport() {
    const nameDisplay = document.getElementById('displayStudentName');
    const schoolDisplay = document.getElementById('displayStudentSchool');
    const xpDisplay = document.getElementById('studentXPDisplay');
    const nameInput = document.getElementById('regStudentName');
    const schoolInput = document.getElementById('regStudentSchool');

    const hasName = state.studentName && state.studentName.trim().length > 0;
    const hasSchool = state.studentSchool && state.studentSchool.trim().length > 0;

    if (nameDisplay) {
      nameDisplay.textContent = hasName ? state.studentName.trim() : 'Student of Distinction';
    }
    if (schoolDisplay) {
      schoolDisplay.textContent = hasSchool ? `${state.studentSchool.trim()} • Saudi Arabia` : 'Intermediate Third Grade • Saudi Arabia';
    }
    if (xpDisplay) xpDisplay.textContent = state.studentXP.toString();
    if (nameInput) nameInput.value = state.studentName;
    if (schoolInput) schoolInput.value = state.studentSchool;

    updateTickerContent();
  }

  const savePassportBtn = document.getElementById('savePassportBtn');
  if (savePassportBtn) {
    savePassportBtn.addEventListener('click', () => {
      const nameIn = document.getElementById('regStudentName');
      const schoolIn = document.getElementById('regStudentSchool');
      const enteredName = nameIn ? nameIn.value.trim() : '';
      const enteredSchool = schoolIn ? schoolIn.value.trim() : '';

      if (!enteredName) {
        alert('Please type your name in the input box to register your Student Identity and earn XP points!');
        if (nameIn) nameIn.focus();
        return;
      }

      state.studentName = enteredName;
      localStorage.setItem('sg3_student_name', state.studentName);

      if (enteredSchool) {
        state.studentSchool = enteredSchool;
        localStorage.setItem('sg3_student_school', state.studentSchool);
      }

      // Award points for writing/registering name!
      const hasBonus = localStorage.getItem('sg3_reg_bonus');
      if (!hasBonus) {
        addXP(25);
        localStorage.setItem('sg3_reg_bonus', 'true');
        alert(`🎉 Student identity successfully registered for: ${state.studentName}!\n\n⭐ +25 XP awarded as Welcome & Registration Bonus!\nYour name is now featured on the top Star Student Ticker.`);
      } else {
        addXP(5);
        alert(`Student identity updated for: ${state.studentName}!\nOfficial certificates and Star Student Ticker have been synchronized.`);
      }

      syncStudentPassport();
      launchTickerPass();
      playSound('correct');
    });
  }

  // Pressing Enter in passport inputs automatically registers
  const regNameInput = document.getElementById('regStudentName');
  const regSchoolInput = document.getElementById('regStudentSchool');
  [regNameInput, regSchoolInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (savePassportBtn) savePassportBtn.click();
        }
      });
    }
  });

  // Reset XP Button
  const resetXPBtn = document.getElementById('resetXPBtn');
  if (resetXPBtn) {
    resetXPBtn.addEventListener('click', () => {
      if (confirm('Reset your Learning Score to 0 XP to start fresh?')) {
        state.studentXP = 0;
        localStorage.setItem('sg3_student_xp', '0');
        localStorage.removeItem('sg3_reg_bonus');
        const xpElem = document.getElementById('studentXPDisplay');
        if (xpElem) xpElem.textContent = '0';
        updateTickerContent();
        playSound('click');
        alert('Learning Score has been reset to 0 XP. Type your name and start solving exercises to earn points!');
      }
    });
  }

  // Direct Certificate Gateway Buttons
  const directCertBtn = document.getElementById('directCertBtn');
  if (directCertBtn) {
    directCertBtn.addEventListener('click', () => {
      showCertificateModal(state.studentName, 'Units 1–4: Complete Term 1 Curriculum Academic Distinction Certification', 98, 'A+ (Distinction)', 'MASTER');
    });
  }

  const headerCertBtn = document.getElementById('headerCertBtn');
  if (headerCertBtn) {
    headerCertBtn.addEventListener('click', () => {
      showCertificateModal(state.studentName, 'Units 1–4: Complete Term 1 Curriculum Academic Distinction Certification', 98, 'A+ (Distinction)', 'MASTER');
    });
  }

  // Deepgram Settings Modal Controls
  window.openDeepgramModal = function() {
    const modal = document.getElementById('deepgramConfigModal');
    const keyInput = document.getElementById('deepgramApiKeyInput');
    const voiceSelect = document.getElementById('deepgramVoiceSelect');
    const rateSelect = document.getElementById('deepgramRateSelect');
    if (keyInput) keyInput.value = state.deepgramApiKey;
    if (voiceSelect) voiceSelect.value = state.deepgramVoice;
    if (rateSelect) rateSelect.value = state.speechRate.toString();
    if (modal) modal.style.display = 'flex';
  };

  window.closeDeepgramModal = function() {
    const modal = document.getElementById('deepgramConfigModal');
    if (modal) modal.style.display = 'none';
  };

  window.saveDeepgramSettings = function() {
    const keyInput = document.getElementById('deepgramApiKeyInput');
    const voiceSelect = document.getElementById('deepgramVoiceSelect');
    const rateSelect = document.getElementById('deepgramRateSelect');
    if (keyInput) {
      state.deepgramApiKey = keyInput.value.trim();
      localStorage.setItem('deepgram_api_key', state.deepgramApiKey);
    }
    if (voiceSelect) {
      state.deepgramVoice = voiceSelect.value;
      localStorage.setItem('deepgram_voice', state.deepgramVoice);
    }
    if (rateSelect) {
      state.speechRate = parseFloat(rateSelect.value) || 1.0;
      localStorage.setItem('preferred_speech_rate', state.speechRate.toString());
    }
    closeDeepgramModal();
    playSound('correct');
    alert(`Voice Settings Saved!\nActive Voice Model: ${state.deepgramVoice}\nSpeed: ${state.speechRate === 0.75 ? '75% (Slow Pace)' : '100% (Normal Pace)'}\nStatus: ${state.deepgramApiKey ? 'Deepgram Aura API Connected' : 'Enhanced Native American Voice Active'}`);
    renderReadingLounge();
  };

  window.testDeepgramVoice = function() {
    const keyInput = document.getElementById('deepgramApiKeyInput');
    const voiceSelect = document.getElementById('deepgramVoiceSelect');
    const testKey = keyInput ? keyInput.value.trim() : state.deepgramApiKey;
    const testVoice = voiceSelect ? voiceSelect.value : state.deepgramVoice;

    const testPhrase = 'Hello! Welcome to Super Goal 3. This is the authentic American voice powered by Deepgram.';
    if (testKey) {
      fetchDeepgramAudio(testPhrase, testVoice).then(url => {
        if (url) {
          const a = new Audio(url);
          a.playbackRate = state.speechRate;
          a.preservesPitch = true;
          a.play();
        } else {
          fallbackAmericanSpeech(testPhrase);
        }
      });
    } else {
      fallbackAmericanSpeech(testPhrase);
    }
  };

  const deepgramBtn = document.getElementById('deepgramSettingsBtn');
  if (deepgramBtn) {
    deepgramBtn.addEventListener('click', openDeepgramModal);
  }

  // Image Viewer Modal Logic
  window.openImageViewer = function(src, caption) {
    const modal = document.getElementById('imageViewerModal');
    const imgElem = document.getElementById('imageViewerSrc');
    const captionElem = document.getElementById('imageViewerCaption');
    if (modal && imgElem && captionElem) {
      imgElem.src = src;
      captionElem.textContent = caption;
      modal.style.display = 'flex';
      playSound('click');
    }
  };

  window.closeImageViewer = function() {
    const modal = document.getElementById('imageViewerModal');
    if (modal) modal.style.display = 'none';
  };

  // Tab Navigation Router
  function switchTab(tabId) {
    state.currentTab = tabId;
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tabId}`);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.switchTab = switchTab;

  // Master Unit Navigation & Global Filtering Engine
  window.selectMasterUnit = function(unitVal, btnElem) {
    state.selectedUnit = unitVal;

    // Synchronize Master Unit Bar UI buttons
    document.querySelectorAll('#masterUnitNavPills .unit-master-btn').forEach(btn => {
      const bUnit = btn.getAttribute('data-unit');
      btn.classList.toggle('active', (unitVal === 'all' && bUnit === 'all') || String(bUnit) === String(unitVal));
    });

    // Synchronize sub-filters across all skill tracks
    if (unitVal === 'all') {
      state.vocabFilter = 'all';
      state.grammarFilter = 'all';
      state.pronunciationFilter = 'all';
      state.discussionFilter = 'all';
      state.examFilter = 'all';
    } else {
      const num = parseInt(unitVal, 10);
      state.vocabFilter = 'u' + num;
      state.grammarFilter = num;
      state.pronunciationFilter = num;
      state.discussionFilter = num;
      state.examFilter = 'u' + num;
      if (num === 1) {
        state.currentReadingStoryId = 'u1_reading_lifestyles';
        state.currentWritingTaskId = 'u1_w1';
        state.currentDiscussionId = 'u1_d1';
      } else if (num === 2) {
        state.currentReadingStoryId = 'u2_reading_king_salman';
        state.currentWritingTaskId = 'u2_w2';
        state.currentDiscussionId = 'u2_d1';
      } else if (num === 3) {
        state.currentReadingStoryId = 'u3_reading_studying_arabic';
        state.currentWritingTaskId = 'u3_w3';
        state.currentDiscussionId = 'u3_d1';
      } else if (num === 4) {
        state.currentReadingStoryId = 'u4_reading_culinary_traditions';
        state.currentWritingTaskId = 'u4_w4';
        state.currentDiscussionId = 'u4_d1';
      }
    }

    // Synchronize Vocabulary filter toolbar buttons
    document.querySelectorAll('#tab-vocabulary .vocab-filter-btn').forEach(b => {
      const f = b.getAttribute('data-filter');
      b.classList.toggle('active', f === state.vocabFilter);
    });
    applyVocabFilters();

    // Synchronize Exam filter toolbar buttons
    document.querySelectorAll('#examFilterBar .vocab-filter-btn').forEach(b => {
      const f = b.getAttribute('data-exam-filter');
      b.classList.toggle('active', f === state.examFilter);
    });

    // Re-render all curriculum sections
    renderOverview();
    renderGrammarAcademy();
    renderSkillsAndPronunciation();
    renderReadingLounge();
    renderWritingStudio();
    renderDiscussionArena();
    renderExamSuite();

    playSound('click');
  };

  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) switchTab(tab);
    });
  });

  // ==========================================================================
  // 1. OVERVIEW & SAUDI CULTURAL SHOWCASE
  // ==========================================================================
  function renderOverview() {
    const container = document.getElementById('overview-content');
    if (!container) return;

    const c = DATA.curriculum;
    const totalVocab = DATA.vocabulary.length;
    const totalGrammar = DATA.grammar.length;
    const totalExams = DATA.exams.length;
    const totalQuestions = DATA.exams.reduce((sum, ex) => sum + ex.questions.length, 0);

    const curUnit = state.selectedUnit;
    const unitsToRender = curUnit === 'all'
      ? c.units
      : c.units.filter(u => u.unitNumber === parseInt(curUnit, 10));

    const overviewSwitcherHtml = `
      <div class="section-unit-switcher">
        <div class="unit-switcher-label">
          <span>🧭</span>
          <strong>Curriculum Scope Focus:</strong>
        </div>
        <div class="unit-switcher-buttons">
          <button class="section-unit-pill ${curUnit === 'all' ? 'active' : ''}" onclick="selectMasterUnit('all')">
            🌟 All Units (${c.units.length})
          </button>
          <button class="section-unit-pill ${curUnit === 1 || curUnit === '1' ? 'active' : ''}" onclick="selectMasterUnit(1)">
            📘 Unit 1: Lifestyles
          </button>
          <button class="section-unit-pill ${curUnit === 2 || curUnit === '2' ? 'active' : ''}" onclick="selectMasterUnit(2)">
            📗 Unit 2: Life Stories
          </button>
          <button class="section-unit-pill ${curUnit === 3 || curUnit === '3' ? 'active' : ''}" onclick="selectMasterUnit(3)">
            ✈️ Unit 3: When Are You Traveling?
          </button>
          <button class="section-unit-pill ${curUnit === 4 || curUnit === '4' ? 'active' : ''}" onclick="selectMasterUnit(4)">
            🛒 Unit 4: What Do I Need to Buy?
          </button>
        </div>
      </div>
    `;

    let unitsHtml = '';
    unitsToRender.forEach(u => {
      const commFuncs = u.communicativeFunctions.map(f => `<li>${f}</li>`).join('');
      const gramFoci = u.grammarFoci.map(g => `<li>${g}</li>`).join('');

      unitsHtml += `
        <div class="card unit-roadmap-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
            <div>
              <span class="brand-badge">Unit ${u.unitNumber}</span>
              <h3 style="font-family:'Outfit',sans-serif; font-size:1.35rem; color:var(--accent-slate-dark); margin-top:0.35rem;">
                ${u.title}
              </h3>
              <p style="font-size:0.85rem; color:var(--primary-coral-dark); font-weight:700;">Student's Book Pages: ${u.pages}</p>
            </div>
            <span class="badge-diff moderate">${u.theme.split(',')[0]}</span>
          </div>

          <p style="font-size:0.92rem; color:var(--text-muted); margin-bottom:1rem;"><strong>Core Theme:</strong> ${u.theme}</p>

          <div style="margin-bottom:1rem;">
            <h4 style="font-size:0.88rem; text-transform:uppercase; color:var(--saudi-green-dark); margin-bottom:0.4rem; font-weight:800;">🎯 Communicative Competencies:</h4>
            <ul style="padding-left:1.25rem; font-size:0.88rem; color:var(--text-main); display:flex; flex-direction:column; gap:0.25rem;">
              ${commFuncs}
            </ul>
          </div>

          <div style="margin-bottom:1rem;">
            <h4 style="font-size:0.88rem; text-transform:uppercase; color:var(--primary-coral-dark); margin-bottom:0.4rem; font-weight:800;">📐 Key Grammatical Standards:</h4>
            <ul style="padding-left:1.25rem; font-size:0.88rem; color:var(--text-main); display:flex; flex-direction:column; gap:0.25rem;">
              ${gramFoci}
            </ul>
          </div>

          <div style="background:var(--primary-coral-subtle); border-left:3px solid var(--primary-coral); padding:0.85rem 1rem; border-radius:0 var(--radius-sm) var(--radius-sm) 0; font-size:0.85rem; margin-top:auto;">
            <p><strong>📖 Reading Passage:</strong> ${u.readingTitle}</p>
            <p><strong>✍️ Writing Task:</strong> ${u.writingTask}</p>
            <p><strong>🗣️ Pronunciation Target:</strong> ${u.pronunciationFocus}</p>
          </div>

          <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:1.15rem; padding-top:0.85rem; border-top:1px dashed var(--border-color);">
            <button class="section-unit-pill" onclick="selectMasterUnit(${u.unitNumber}); switchTab('vocabulary');" title="Open Unit Vocabulary">
              📚 Vocabulary
            </button>
            <button class="section-unit-pill" onclick="selectMasterUnit(${u.unitNumber}); switchTab('grammar');" title="Open Unit Grammar">
              📐 Grammar
            </button>
            <button class="section-unit-pill" onclick="selectMasterUnit(${u.unitNumber}); switchTab('pronunciation');" title="Open Unit Pronunciation Lab">
              🗣️ Lab
            </button>
            <button class="section-unit-pill" onclick="selectMasterUnit(${u.unitNumber}); switchTab('reading');" title="Open Unit Reading Story">
              📖 Reading
            </button>
            <button class="section-unit-pill" onclick="selectMasterUnit(${u.unitNumber}); switchTab('writing');" title="Open Unit Writing Task">
              ✍️ Writing
            </button>
            <button class="section-unit-pill" onclick="selectMasterUnit(${u.unitNumber}); switchTab('exams');" title="Open Unit Exams">
              📝 Exams
            </button>
          </div>
        </div>
      `;
    });

    let showcaseHtml = '';
    if (c.saudiShowcase && c.saudiShowcase.length > 0) {
      showcaseHtml = `
        <div class="saudi-showcase-section">
          <div class="section-header" style="margin-bottom:1rem;">
            <div>
              <h2>🇸🇦 Authentic Saudi Cultural Heritage & Vision 2030 Showcase</h2>
              <p>Explore authentic Saudi landmarks and cultural pillars integrated directly into Super Goal 3. Click any photograph to inspect in full resolution.</p>
            </div>
          </div>
          <div class="saudi-showcase-grid">
            ${c.saudiShowcase.map(sc => `
              <div class="cultural-card" onclick="openImageViewer('${sc.image}', '${sc.title}: ${sc.description}')">
                <div class="cultural-img-wrap">
                  <img src="${sc.image}" alt="${sc.title}">
                  <span class="cultural-tag">${sc.tag}</span>
                </div>
                <div class="cultural-content">
                  <h4>${sc.title}</h4>
                  <p>${sc.description}</p>
                  <div class="cultural-card-footer">
                    <span>🔍 Click to inspect in HD</span>
                    <span>🇸🇦 Saudi Arabia</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="hero-card">
        <div class="hero-text">
          <span class="hero-tag">🇸🇦 Saudi Ministry of Education Curriculum</span>
          <h2>Super Goal 3 (Units 1–4: Complete Term 1 Curriculum Suite) Master Platform</h2>
          <p>${c.overview}</p>
          <div class="hero-stats-row">
            <div class="hero-stat-box">
              <span class="num">${c.units.length}</span>
              <span class="lbl">Focus Units</span>
            </div>
            <div class="hero-stat-box">
              <span class="num">${totalVocab}</span>
              <span class="lbl">Vocabulary Words</span>
            </div>
            <div class="hero-stat-box">
              <span class="num">${totalGrammar}</span>
              <span class="lbl">Grammar Modules</span>
            </div>
            <div class="hero-stat-box">
              <span class="num">${totalExams}</span>
              <span class="lbl">Tiered Exams</span>
            </div>
            <div class="hero-stat-box">
              <span class="num">${totalQuestions}</span>
              <span class="lbl">Total Questions</span>
            </div>
          </div>
        </div>
        <div class="hero-image-wrap">
          <img src="assets/images/super_goal_3_cover.jpg" alt="Super Goal 3 Student Book Cover" class="hero-book-cover" onclick="openImageViewer('assets/images/super_goal_3_cover.jpg', 'Super Goal 3 Official Student Book Cover - Saudi Ministry of Education')">
          <div style="font-size:0.75rem; color:var(--text-light); margin-top:0.5rem; font-weight:700;">👆 Click cover to zoom</div>
        </div>
      </div>

      ${showcaseHtml}

      <div class="section-header">
        <div>
          <h2>Super Goal 3 Curriculum Matrix & Learning Standards (Units 1 & 2)</h2>
          <p>Systematic breakdown of functional dialogues, grammar formulas, phonological rules, and writing criteria for Second Intermediate students.</p>
        </div>
      </div>

      ${overviewSwitcherHtml}

      <div class="${unitsToRender.length === 1 ? 'grid-1' : 'grid-2'}">
        ${unitsHtml}
      </div>
    `;
  }

  // ==========================================================================
  // 2. VOCABULARY HUB
  // ==========================================================================
  function applyVocabFilters() {
    const q = state.vocabSearch.toLowerCase().trim();
    const filter = state.vocabFilter;

    state.filteredVocab = DATA.vocabulary.filter(v => {
      const matchesSearch = !q || 
        v.word.toLowerCase().includes(q) || 
        v.definition.toLowerCase().includes(q) || 
        v.category.toLowerCase().includes(q) || 
        v.pos.toLowerCase().includes(q) ||
        (v.saudiCulturalContext && v.saudiCulturalContext.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (filter === 'all') return true;
      if (filter === 'u1') return v.unit === 1;
      if (filter === 'u2') return v.unit === 2;
      if (filter === 'u3') return v.unit === 3;
      if (filter === 'u4') return v.unit === 4;
      if (filter === 'culinary') return v.category && (v.category.includes('Culinary') || v.category.includes('Produce') || v.category.includes('Cooking') || v.category.includes('Food') || v.category.includes('Ingredients') || v.category.includes('Baking') || v.category.includes('Meats'));
      if (filter === 'travel') return v.category && (v.category.includes('Travel') || v.category.includes('Airport') || v.category.includes('Flight'));
      if (filter === 'nouns') return v.pos === 'noun';
      if (filter === 'verbs') return v.pos === 'verb';
      if (filter === 'phrases') return v.pos === 'phrase' || v.pos === 'idiom' || (v.category && (v.category.includes('Phrases') || v.category.includes('Habits')));
      if (filter === 'adjectives') return v.pos === 'adjective';
      if (filter === 'realtalk') return v.category && (v.category.includes('Real Talk') || v.category.includes('Social') || v.category.includes('Etiquette'));
      if (filter === 'fitness') return v.category && (v.category.includes('Fitness') || v.category.includes('Sport') || v.category.includes('Athletic'));
      if (filter === 'civic') return v.category && (v.category.includes('Charity') || v.category.includes('Philanthropy') || v.category.includes('Civic') || v.category.includes('Environment') || v.category.includes('Society'));
      if (filter === 'frequency') return v.category && v.category.includes('Frequency');
      if (filter === 'diet') return v.category && (v.category.includes('Diet') || v.category.includes('Wellness') || v.category.includes('Nutrition'));
      if (filter === 'archetypes') return v.category && v.category.includes('Archetypes');
      if (filter === 'digital') return v.category && (v.category.includes('Digital') || v.category.includes('Screen'));
      if (filter === 'quantifiers') return v.category && (v.category.includes('Quantifier') || v.category.includes('Survey'));

      return true;
    });

    state.vocabFlashcardIndex = 0;
    renderVocabDisplay();
  }

  function renderVocabDisplay() {
    const gridContainer = document.getElementById('vocab-grid-container');
    const flashcardContainer = document.getElementById('vocab-flashcard-container');
    const badge = document.getElementById('vocab-count-badge');

    if (badge) {
      badge.textContent = `Displaying ${state.filteredVocab.length} of ${DATA.vocabulary.length} Words`;
    }

    if (!gridContainer || !flashcardContainer) return;

    if (state.filteredVocab.length === 0) {
      gridContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">No vocabulary items match your criteria.</div>`;
    } else {
      gridContainer.innerHTML = state.filteredVocab.map(v => `
        <div class="vocab-card">
          <div class="vocab-header">
            <div class="vocab-word-row">
              <span class="vocab-word">${v.word}</span>
              <button class="audio-btn" onclick="speakText('${v.word.replace(/'/g, "\\'")}')" title="Listen with Deepgram American Voice">🔊</button>
            </div>
            <div style="display:flex; gap:0.35rem; align-items:center;">
              <span class="brand-badge" style="font-size:0.65rem; padding:0.15rem 0.45rem;">U${v.unit}</span>
              <span class="vocab-pos-badge">${v.pos}</span>
            </div>
          </div>
          <div class="vocab-phonetic">${v.phonetic}</div>
          <p class="vocab-definition">${v.definition}</p>
          <div class="vocab-example-box">
            "${v.example}"
          </div>
          ${v.saudiCulturalContext ? `
            <div class="saudi-context-box">
              🇸🇦 <strong>Saudi Context:</strong> ${v.saudiCulturalContext}
            </div>
          ` : ''}
        </div>
      `).join('');
    }

    if (state.filteredVocab.length > 0) {
      const cur = state.filteredVocab[state.vocabFlashcardIndex];
      flashcardContainer.innerHTML = `
        <div class="flashcard-wrapper">
          <div class="flashcard-inner" id="activeFlashcard">
            <div class="flashcard-front">
              <span class="brand-badge" style="margin-bottom:1rem;">Unit ${cur.unit} • ${cur.category}</span>
              <h2 style="font-family:'Outfit',sans-serif; font-size:2.4rem; color:var(--accent-slate-dark); margin-bottom:0.5rem;">${cur.word}</h2>
              <p style="font-family:monospace; color:var(--primary-coral-dark); font-size:1.15rem; margin-bottom:1rem;">${cur.phonetic}</p>
              <button class="audio-btn" onclick="event.stopPropagation(); speakText('${cur.word.replace(/'/g, "\\'")}')" style="width:48px; height:48px; font-size:1.3rem; margin-bottom:1.5rem;">🔊</button>
              <p style="font-size:0.85rem; color:var(--text-light); text-transform:uppercase; font-weight:800;">👆 Click anywhere to flip card</p>
            </div>
            <div class="flashcard-back">
              <span class="vocab-pos-badge" style="margin-bottom:0.75rem;">Part of Speech: ${cur.pos}</span>
              <h3 style="font-family:'Outfit',sans-serif; font-size:1.4rem; color:var(--accent-slate-dark); margin-bottom:0.75rem;">Academic Definition</h3>
              <p style="font-size:1.05rem; line-height:1.6; color:var(--text-main); margin-bottom:1.25rem;">${cur.definition}</p>
              <div class="vocab-example-box" style="text-align:left; width:100%; margin-bottom:0.75rem;">
                <strong>Context:</strong> "${cur.example}"
              </div>
              ${cur.saudiCulturalContext ? `
                <div class="saudi-context-box" style="text-align:left; width:100%;">
                  🇸🇦 <strong>Saudi Heritage:</strong> ${cur.saudiCulturalContext}
                </div>
              ` : ''}
            </div>
          </div>
          <div class="flashcard-nav">
            <button class="flashcard-nav-btn" id="prevFlashcardBtn">◀ Previous</button>
            <span style="font-weight:800; color:var(--text-muted); font-size:0.95rem;">
              ${state.vocabFlashcardIndex + 1} / ${state.filteredVocab.length}
            </span>
            <button class="flashcard-nav-btn" id="nextFlashcardBtn">Next ▶</button>
          </div>
        </div>
      `;

      const card = document.getElementById('activeFlashcard');
      if (card) {
        card.addEventListener('click', () => {
          card.classList.toggle('flipped');
          playSound('click');
          addXP(2);
        });
      }

      const prevBtn = document.getElementById('prevFlashcardBtn');
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (state.vocabFlashcardIndex > 0) {
            state.vocabFlashcardIndex--;
            renderVocabDisplay();
          }
        });
      }

      const nextBtn = document.getElementById('nextFlashcardBtn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (state.vocabFlashcardIndex < state.filteredVocab.length - 1) {
            state.vocabFlashcardIndex++;
            renderVocabDisplay();
          }
        });
      }
    }
  }

  // Vocab Listeners
  const vocabSearchInput = document.getElementById('vocabSearchInput');
  if (vocabSearchInput) {
    vocabSearchInput.addEventListener('input', (e) => {
      state.vocabSearch = e.target.value;
      applyVocabFilters();
    });
  }

  document.querySelectorAll('#tab-vocabulary .vocab-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#tab-vocabulary .vocab-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.vocabFilter = btn.getAttribute('data-filter');
      applyVocabFilters();
    });
  });

  document.querySelectorAll('.vocab-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.vocab-view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.getAttribute('data-view');
      const grid = document.getElementById('vocab-grid-container');
      const flash = document.getElementById('vocab-flashcard-container');
      if (view === 'grid') {
        grid.style.display = 'grid';
        flash.style.display = 'none';
      } else {
        grid.style.display = 'none';
        flash.style.display = 'block';
      }
    });
  });

  // ==========================================================================
  // 3. GRAMMAR ACADEMY
  // ==========================================================================
  function renderGrammarAcademy() {
    const container = document.getElementById('grammar-modules-container');
    if (!container) return;

    const filter = state.grammarFilter || state.selectedUnit || 'all';
    const modulesToRender = DATA.grammar.filter(m => {
      if (filter === 'all') return true;
      return m.unit === parseInt(filter, 10);
    });

    const switcherHtml = `
      <div class="section-unit-switcher">
        <div class="unit-switcher-label">
          <span>🧭</span>
          <strong>Grammar Academy Unit Focus:</strong>
        </div>
        <div class="unit-switcher-buttons">
          <button class="section-unit-pill ${filter === 'all' ? 'active' : ''}" onclick="filterGrammarUnit('all')">
            🌟 All Modules (${DATA.grammar.length})
          </button>
          <button class="section-unit-pill ${filter === 1 || filter === '1' ? 'active' : ''}" onclick="filterGrammarUnit(1)">
            📘 Unit 1: Present & Frequency (Modules 1 & 2)
          </button>
          <button class="section-unit-pill ${filter === 2 || filter === '2' ? 'active' : ''}" onclick="filterGrammarUnit(2)">
            📗 Unit 2: Past & 'Used to' (Modules 3 & 4)
          </button>
          <button class="section-unit-pill ${filter === 3 || filter === '3' ? 'active' : ''}" onclick="filterGrammarUnit(3)">
            ✈️ Unit 3: Future & Infinitives (Modules 5 & 6)
          </button>
          <button class="section-unit-pill ${filter === 4 || filter === '4' ? 'active' : ''}" onclick="filterGrammarUnit(4)">
            🛒 Unit 4: Quantifiers & Reflexives (Modules 7 & 8)
          </button>
        </div>
      </div>
    `;

    container.innerHTML = switcherHtml + modulesToRender.map(m => {
      let tableRows = '';
      if (m.comparisonTable && m.comparisonTable.length > 0) {
        const keys = Object.keys(m.comparisonTable[0]);
        const ths = keys.map(k => `<th>${k.replace(/([A-Z])/g, ' $1').toUpperCase()}</th>`).join('');
        const trs = m.comparisonTable.map(row => {
          const tds = keys.map(k => `<td>${row[k]}</td>`).join('');
          return `<tr>${tds}</tr>`;
        }).join('');
        tableRows = `
          <div style="overflow-x:auto;">
            <table class="grammar-table">
              <thead><tr>${ths}</tr></thead>
              <tbody>${trs}</tbody>
            </table>
          </div>
        `;
      }

      let errorsHtml = '';
      if (m.commonErrors && m.commonErrors.length > 0) {
        errorsHtml = `
          <div style="margin:1.35rem 0; background:var(--error-bg); border-left:4px solid var(--error); padding:1.15rem; border-radius:0 var(--radius-sm) var(--radius-sm) 0;">
            <h4 style="color:var(--error); font-size:0.95rem; margin-bottom:0.6rem; font-weight:800;">⚠️ Diagnostic Error Autopsy (Common Pitfalls):</h4>
            <div style="display:flex; flex-direction:column; gap:0.6rem; font-size:0.9rem;">
              ${m.commonErrors.map(err => `
                <div>
                  <span style="text-decoration:line-through; color:var(--error); font-weight:800;">${err.incorrect}</span> ➔ 
                  <span style="color:var(--success); font-weight:800;">${err.correct}</span>
                  <p style="color:var(--text-muted); font-size:0.84rem; margin-top:0.2rem;">${err.note}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      let diagHtml = '';
      if (m.diagnosticQuestions && m.diagnosticQuestions.length > 0) {
        diagHtml = `
          <div class="diagnostic-bench">
            <h4>🧪 Interactive Diagnostic Practice Bench (4 Questions)</h4>
            <p style="font-size:0.86rem; color:var(--text-muted); margin-bottom:1.15rem;">Select an option to test your understanding. Correct answers award XP and unlock in-depth structural rationales.</p>
            ${m.diagnosticQuestions.map((q, idx) => `
              <div class="diag-question-item" data-mod="${m.id}" data-q="${idx}">
                <span class="visual-clue-badge">🇸🇦 Super Goal 3 Practice Clue</span>
                <p class="diag-question-text">${idx + 1}. ${q.question}</p>
                <div class="diag-options-grid">
                  ${q.options.map((opt, optIdx) => `
                    <button class="diag-opt-btn" onclick="checkDiagAnswer('${m.id}', ${idx}, ${optIdx}, this)">
                      ${String.fromCharCode(65 + optIdx)}. ${opt}
                    </button>
                  `).join('')}
                </div>
                <div class="diag-explanation" id="exp_${m.id}_${idx}">
                  <strong>Academic Explanation:</strong> ${q.explanation}
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }

      return `
        <div class="grammar-module-card">
          <div class="grammar-module-header">
            <div>
              <span class="brand-badge">Unit ${m.unit} Standard</span>
              <h3 style="margin-top:0.35rem;">${m.title}</h3>
            </div>
            <span class="badge-diff moderate">Module ${m.id.toUpperCase()}</span>
          </div>
          <p style="color:var(--text-muted); font-size:0.96rem;">${m.summary}</p>
          <div class="grammar-formula-box">
            <strong>Formula:</strong> ${m.formula}
          </div>
          ${tableRows}
          ${errorsHtml}
          ${diagHtml}
        </div>
      `;
    }).join('');
  }

  window.filterGrammarUnit = function(unitVal) {
    state.grammarFilter = unitVal;
    renderGrammarAcademy();
    playSound('click');
  };

  window.checkDiagAnswer = function(modId, qIdx, selectedOptIdx, btnElem) {
    const mod = DATA.grammar.find(g => g.id === modId);
    if (!mod) return;
    const q = mod.diagnosticQuestions[qIdx];
    const parent = btnElem.closest('.diag-question-item');
    const buttons = parent.querySelectorAll('.diag-opt-btn');
    buttons.forEach((b, i) => {
      b.disabled = true;
      if (i === q.correctAnswer) b.classList.add('correct');
      if (i === selectedOptIdx && i !== q.correctAnswer) b.classList.add('incorrect');
    });

    if (selectedOptIdx === q.correctAnswer) {
      playSound('correct');
      addXP(15);
    } else {
      playSound('click');
    }

    const expDiv = document.getElementById(`exp_${modId}_${qIdx}`);
    if (expDiv) expDiv.style.display = 'block';
  };

  // ==========================================================================
  // 4. SKILLS & PRONUNCIATION
  // ==========================================================================
  function renderSkillsAndPronunciation() {
    const container = document.getElementById('skills-lab-content');
    if (!container) return;

    const filter = state.pronunciationFilter || state.selectedUnit || 'all';
    const labsToRender = DATA.pronunciation.filter(p => {
      if (filter === 'all') return true;
      return p.unit === parseInt(filter, 10);
    });

    const switcherHtml = `
      <div class="section-unit-switcher">
        <div class="unit-switcher-label">
          <span>🧭</span>
          <strong>Phonology Studio Unit Focus:</strong>
        </div>
        <div class="unit-switcher-buttons">
          <button class="section-unit-pill ${filter === 'all' ? 'active' : ''}" onclick="filterPronunciationUnit('all')">
            🌟 All Labs (${DATA.pronunciation.length})
          </button>
          <button class="section-unit-pill ${filter === 1 || filter === '1' ? 'active' : ''}" onclick="filterPronunciationUnit(1)">
            📘 Unit 1: Auxiliary Reductions (/duː juː/ → /dʒə/)
          </button>
          <button class="section-unit-pill ${filter === 2 || filter === '2' ? 'active' : ''}" onclick="filterPronunciationUnit(2)">
            📗 Unit 2: Connected Speech Reduction (/ˈjuːs.tə/)
          </button>
          <button class="section-unit-pill ${filter === 3 || filter === '3' ? 'active' : ''}" onclick="filterPronunciationUnit(3)">
            ✈️ Unit 3: Connected Reduction of 'Going To' (/ˈɡənə/)
          </button>
          <button class="section-unit-pill ${filter === 4 || filter === '4' ? 'active' : ''}" onclick="filterPronunciationUnit(4)">
            🛒 Unit 4: Listing Pitch Contours
          </button>
        </div>
      </div>
    `;

    const gridClass = labsToRender.length === 1 ? 'grid-1' : (labsToRender.length === 2 ? 'grid-2' : 'grid-3');

    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Phonology & Speech Acoustics Studio</h2>
          <p>Targeted pronunciation rules, connected speech reductions, intonation contours, and minimal pair vowel contrasts for Super Goal 3 (Units 1–4: Complete Term 1 Curriculum Suite).</p>
        </div>
      </div>

      ${switcherHtml}

      <div class="${gridClass}">
        ${labsToRender.map(p => `
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
              <div>
                <span class="brand-badge">Unit ${p.unit} Phonetics</span>
                <h3 style="font-family:'Outfit',sans-serif; font-size:1.35rem; color:var(--accent-slate-dark); margin-top:0.35rem;">
                  ${p.title}
                </h3>
              </div>
            </div>
            <p style="color:var(--text-muted); font-size:0.92rem; margin-bottom:1.25rem;">${p.description}</p>

            ${p.rules.map(r => `
              <div style="background:var(--bg-main); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:1rem; margin-bottom:1rem;">
                <h4 style="font-size:0.95rem; color:var(--primary-coral-dark); margin-bottom:0.35rem;">${r.type}</h4>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:0.75rem;">${r.rule}</p>
                <div style="display:flex; flex-direction:column; gap:0.45rem;">
                  ${r.examples.map(ex => `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; padding:0.5rem 0.95rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); font-size:0.9rem;">
                      <span style="font-weight:700;">${ex.sentence}</span>
                      <button class="audio-btn" onclick="speakText('${ex.audioText.replace(/'/g, "\\'")}')" title="Listen with Deepgram American Voice">🔊</button>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}

            <div style="background:var(--primary-coral-light); border-left:3.5px solid var(--primary-coral); padding:0.9rem; border-radius:0 var(--radius-sm) var(--radius-sm) 0; font-size:0.88rem; margin-top:auto;">
              <h4 style="color:var(--primary-coral-deep); margin-bottom:0.35rem; font-weight:800;">Contrast Drills:</h4>
              <ul style="padding-left:1.2rem; color:var(--text-main);">
                ${p.contrastPairs.map(cp => `<li>${cp.pair}</li>`).join('')}
              </ul>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ==========================================================================
  // 5. READING STORIES LOUNGE (Deepgram American Audio & Live Highlighting)
  // ==========================================================================
  window.filterPronunciationUnit = function(unitVal) {
    state.pronunciationFilter = unitVal;
    renderSkillsAndPronunciation();
    playSound('click');
  };

  function clearAllReadingHighlights() {
    document.querySelectorAll('#highlightableCanvas .sentence-span').forEach(s => s.classList.remove('sentence-active'));
    document.querySelectorAll('#highlightableCanvas .word-span').forEach(w => w.classList.remove('word-highlighted'));
  }

  function clearWordHighlights() {
    document.querySelectorAll('#highlightableCanvas .word-span').forEach(w => w.classList.remove('word-highlighted'));
  }

  // Precompute weighted word timeline for continuous zero-drift alignment in Deepgram audio
  function buildWordTimeline(allWordSpans) {
    let totalWeight = 0;
    const items = allWordSpans.map(wElem => {
      const text = wElem.innerText.trim();
      let weight = Math.max(2, text.length) * 1.0;
      if (/[.!?]$/.test(text)) {
        weight += 10.0; // pause for sentence end
      } else if (/[,;:]$/.test(text)) {
        weight += 4.5; // pause for comma / clause
      } else {
        weight += 1.2;
      }
      totalWeight += weight;
      return { elem: wElem, weight, text };
    });
    return { items, totalWeight };
  }

  // Real-time animation frame sync for Deepgram audio
  function startAudioTimeSync(audio, timeline) {
    if (state.readingAnimationTimer) {
      cancelAnimationFrame(state.readingAnimationTimer);
    }

    function syncFrame() {
      if (!state.isReadingPlaying || !state.currentAudioObject) return;

      const duration = audio.duration;
      if (duration && duration > 0 && timeline.totalWeight > 0) {
        const curTime = audio.currentTime;
        const progress = Math.min(1, Math.max(0, curTime / duration));
        const targetWeight = progress * timeline.totalWeight;

        let accumulated = 0;
        let matchedElem = null;
        for (const item of timeline.items) {
          if (accumulated + item.weight >= targetWeight) {
            matchedElem = item.elem;
            break;
          }
          accumulated += item.weight;
        }

        if (matchedElem) {
          clearWordHighlights();
          matchedElem.classList.add('word-highlighted');
          const parentSentence = matchedElem.closest('.sentence-span');
          if (parentSentence && !parentSentence.classList.contains('sentence-active')) {
            document.querySelectorAll('#highlightableCanvas .sentence-span').forEach(s => s.classList.remove('sentence-active'));
            parentSentence.classList.add('sentence-active');
            parentSentence.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }

      state.readingAnimationTimer = requestAnimationFrame(syncFrame);
    }

    state.readingAnimationTimer = requestAnimationFrame(syncFrame);
  }

  // High-performance Dual-Engine Synchronized American Speech (Zero Delay & Real-time Cadence Tracking)
  function playSentenceChainedSpeech(startFromSentenceIndex = 0) {
    const sentenceSpans = Array.from(document.querySelectorAll('#highlightableCanvas .sentence-span'));
    if (!sentenceSpans.length) return;

    state.readingSentenceIndex = startFromSentenceIndex;

    function playNextSentence(index) {
      if (!state.isReadingPlaying) return;
      if (index >= sentenceSpans.length) {
        stopCurrentAudio();
        addXP(15);
        return;
      }

      // Clear any running timers from previous sentence
      if (state.sentenceStepTimer) {
        cancelAnimationFrame(state.sentenceStepTimer);
        state.sentenceStepTimer = null;
      }
      if (state.sentenceSafetyTimer) {
        clearTimeout(state.sentenceSafetyTimer);
        state.sentenceSafetyTimer = null;
      }

      state.readingSentenceIndex = index;
      const sentSpan = sentenceSpans[index];
      const sText = sentSpan.innerText.trim();

      // Activate sentence visually and scroll smoothly into view
      sentenceSpans.forEach(s => s.classList.remove('sentence-active'));
      sentSpan.classList.add('sentence-active');
      sentSpan.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Clear words and activate initial word
      clearWordHighlights();
      const wordSpans = Array.from(sentSpan.querySelectorAll('.word-span'));
      if (wordSpans.length > 0) {
        wordSpans[0].classList.add('word-highlighted');
      }

      // Map words to character offsets & duration milestones
      const wordMap = [];
      let currentOffset = 0;
      let totalEstMs = 0;
      const rateMultiplier = 1 / (state.speechRate || 1.0); // 0.75x = 1.33x duration, 1.0x = 1.0x duration

      for (let i = 0; i < wordSpans.length; i++) {
        const wElem = wordSpans[i];
        const raw = wElem.innerText.trim();
        const start = sText.indexOf(raw, currentOffset);
        const actualStart = start !== -1 ? start : currentOffset;
        const actualEnd = actualStart + raw.length;
        currentOffset = actualEnd;

        // Acoustic weight heuristic:
        // Base speech speed ~ 52ms per character at 1.0x rate + base 85ms per word
        let wordDurationMs = (Math.max(2, raw.length) * 52 + 85) * rateMultiplier;
        if (/[.!?]$/.test(raw)) {
          wordDurationMs += 380 * rateMultiplier; // sentence closure pause
        } else if (/[,;:]$/.test(raw)) {
          wordDurationMs += 200 * rateMultiplier; // clause pause
        }

        const startMs = totalEstMs;
        totalEstMs += wordDurationMs;
        const endMs = totalEstMs;

        wordMap.push({
          index: i,
          elem: wElem,
          start: actualStart,
          end: actualEnd,
          raw: raw,
          startMs: startMs,
          endMs: endMs
        });
      }

      // Setup utterance with state.speechRate (0.75x or 1.0x)
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(sText);
      const usVoice = getBestAmericanVoice();
      if (usVoice) utterance.voice = usVoice;
      utterance.lang = 'en-US';
      utterance.rate = state.speechRate; // 0.75 or 1.0
      utterance.pitch = 1.0;

      // Retain utterance globally to prevent Chromium GC freeze bug
      state.currentUtterance = utterance;
      window.__activeReadingUtterance = utterance;

      let speechStartTime = 0;
      let currentWordIndex = 0;
      let hasFinished = false;

      function highlightWordAtIndex(targetIdx) {
        if (targetIdx < 0 || targetIdx >= wordSpans.length) return;
        currentWordIndex = targetIdx;
        clearWordHighlights();
        wordSpans[targetIdx].classList.add('word-highlighted');
      }

      // Continuous time-stepper synchronization loop
      function runCadenceStepper() {
        if (!state.isReadingPlaying || hasFinished) return;
        if (!speechStartTime) return;

        const elapsedMs = performance.now() - speechStartTime;
        // Find expected word from time milestone
        for (let i = 0; i < wordMap.length; i++) {
          if (elapsedMs >= wordMap[i].startMs && elapsedMs < wordMap[i].endMs) {
            if (currentWordIndex !== i) {
              highlightWordAtIndex(i);
            }
            break;
          }
        }

        state.sentenceStepTimer = requestAnimationFrame(runCadenceStepper);
      }

      utterance.onstart = () => {
        if (!state.isReadingPlaying) return;
        speechStartTime = performance.now();
        highlightWordAtIndex(0);
        state.sentenceStepTimer = requestAnimationFrame(runCadenceStepper);
      };

      // Native boundary reconciliation: if browser emits boundary, snap immediately
      utterance.onboundary = (e) => {
        if (!state.isReadingPlaying || hasFinished) return;
        const charIdx = e.charIndex;
        let matched = wordMap.find(item => charIdx >= item.start && charIdx < item.end);
        if (!matched && wordMap.length > 0) {
          let minDiff = 999;
          for (const item of wordMap) {
            const diff = Math.abs(item.start - charIdx);
            if (diff < minDiff) {
              minDiff = diff;
              matched = item;
            }
          }
        }
        if (matched) {
          highlightWordAtIndex(matched.index);
          // Recalibrate start time to lock stepper to audio
          if (speechStartTime > 0) {
            speechStartTime = performance.now() - matched.startMs;
          }
        }
      };

      function completeSentence() {
        if (hasFinished) return;
        hasFinished = true;
        if (state.sentenceStepTimer) {
          cancelAnimationFrame(state.sentenceStepTimer);
          state.sentenceStepTimer = null;
        }
        if (state.sentenceSafetyTimer) {
          clearTimeout(state.sentenceSafetyTimer);
          state.sentenceSafetyTimer = null;
        }
        if (!state.isReadingPlaying) return;
        playNextSentence(index + 1);
      }

      utterance.onend = completeSentence;

      utterance.onerror = (err) => {
        console.warn('Utterance error or interrupted, skipping to next sentence:', err);
        completeSentence();
      };

      // Chromium safety timeout (expected duration + 1800ms grace)
      const safetyTimeoutMs = Math.max(3000, totalEstMs + 1800);
      state.sentenceSafetyTimer = setTimeout(() => {
        if (state.isReadingPlaying && !hasFinished) {
          console.warn('Speech timeout failsafe triggered for sentence index:', index);
          completeSentence();
        }
      }, safetyTimeoutMs);

      window.speechSynthesis.speak(utterance);
    }

    playNextSentence(startFromSentenceIndex);
  }

  // Interactive sentence clicking
  window.playSingleSentence = function(sentenceId) {
    stopCurrentAudio();
    const sentSpan = document.getElementById(sentenceId);
    if (!sentSpan) return;

    state.isReadingPlaying = true;
    setEqualizerAnimating(true);
    addXP(2);

    const playBtn = document.getElementById('playHighlightBtn');
    if (playBtn) playBtn.innerHTML = '⏸ Pause Reading';

    const sentenceSpans = Array.from(document.querySelectorAll('#highlightableCanvas .sentence-span'));
    const idx = sentenceSpans.indexOf(sentSpan);
    if (idx !== -1) {
      playSentenceChainedSpeech(idx);
    }
  };

  // Toggle Speech Rate (0.75x slow vs 1.0x normal)
  window.toggleSpeechRate = function() {
    state.speechRate = state.speechRate === 0.75 ? 1.0 : 0.75;
    localStorage.setItem('preferred_speech_rate', state.speechRate.toString());

    // Update button in UI
    const btn = document.getElementById('readingSpeedToggleBtn');
    if (btn) {
      if (state.speechRate === 0.75) {
        btn.innerHTML = '🐢 Speed: 75% (Slow)';
        btn.classList.add('speed-slow');
      } else {
        btn.innerHTML = '⚡ Speed: 100% (Normal)';
        btn.classList.remove('speed-slow');
      }
    }

    // Update modal select if open
    const rateSelect = document.getElementById('deepgramRateSelect');
    if (rateSelect) {
      rateSelect.value = state.speechRate.toString();
    }

    // If audio is actively playing, adapt speed instantly
    if (state.currentAudioObject) {
      state.currentAudioObject.playbackRate = state.speechRate;
    } else if (state.isReadingPlaying && 'speechSynthesis' in window) {
      playSentenceChainedSpeech(state.readingSentenceIndex);
    }

    playSound('click');
  };


  // ==========================================================================
  // INTERACTIVE WORD DEFINITION & PHONETICS ENGINE
  // ==========================================================================
  function lookupWordMeaning(rawWord) {
    if (!rawWord) return null;
    const clean = rawWord.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!clean) return null;

    // 1. Direct match in DATA.vocabulary (180 core curriculum words)
    const vocabMatch = DATA.vocabulary.find(v => v.word.toLowerCase().replace(/[^a-z0-9]/g, '') === clean);
    if (vocabMatch) {
      return {
        word: vocabMatch.word,
        pos: vocabMatch.pos,
        phonetic: vocabMatch.phonetic,
        definition: vocabMatch.definition,
        example: vocabMatch.example,
        saudiContext: vocabMatch.saudiContext || null,
        unit: vocabMatch.unit,
        topic: vocabMatch.topic,
        isCore: true,
        root: null
      };
    }

    // 2. Direct match in DATA.readingGlossary (588 curated reading terms)
    if (DATA.readingGlossary && DATA.readingGlossary[clean]) {
      const g = DATA.readingGlossary[clean];
      return {
        word: rawWord,
        pos: g.pos,
        phonetic: g.phonetic,
        definition: g.definition,
        example: g.example,
        saudiContext: g.saudiContext || null,
        unit: null,
        topic: 'Reading Passage Vocabulary',
        isCore: false,
        root: null
      };
    }

    // 3. Morphological Stemming / Lemmatization (De-inflection)
    const candidates = [];
    if (clean.endsWith('ies')) candidates.push({ stem: clean.slice(0, -3) + 'y', rule: 'Plural / 3rd-person form of' });
    if (clean.endsWith('es')) candidates.push({ stem: clean.slice(0, -2), rule: 'Plural / 3rd-person form of' });
    if (clean.endsWith('s') && !clean.endsWith('ss')) candidates.push({ stem: clean.slice(0, -1), rule: 'Plural / 3rd-person form of' });
    if (clean.endsWith('ed')) {
      candidates.push({ stem: clean.slice(0, -2), rule: 'Past tense / participle of' });
      candidates.push({ stem: clean.slice(0, -1), rule: 'Past tense / participle of' });
    }
    if (clean.endsWith('ing')) {
      candidates.push({ stem: clean.slice(0, -3), rule: 'Present participle / gerund of' });
      candidates.push({ stem: clean.slice(0, -3) + 'e', rule: 'Present participle / gerund of' });
      if (clean.length > 4 && clean[clean.length - 4] === clean[clean.length - 5]) {
        candidates.push({ stem: clean.slice(0, -4), rule: 'Present participle of' });
      }
    }
    if (clean.endsWith('ly')) candidates.push({ stem: clean.slice(0, -2), rule: 'Adverb derived from' });
    if (clean.endsWith('er')) candidates.push({ stem: clean.slice(0, -2), rule: 'Comparative form of' });
    if (clean.endsWith('est')) candidates.push({ stem: clean.slice(0, -3), rule: 'Superlative form of' });

    for (const c of candidates) {
      const vMatch = DATA.vocabulary.find(v => v.word.toLowerCase().replace(/[^a-z0-9]/g, '') === c.stem);
      if (vMatch) {
        return {
          word: rawWord,
          pos: vMatch.pos,
          phonetic: vMatch.phonetic,
          definition: `${c.rule} "${vMatch.word}": ${vMatch.definition}`,
          example: vMatch.example,
          saudiContext: vMatch.saudiContext || null,
          unit: vMatch.unit,
          topic: vMatch.topic,
          isCore: true,
          root: vMatch.word
        };
      }
      if (DATA.readingGlossary && DATA.readingGlossary[c.stem]) {
        const g = DATA.readingGlossary[c.stem];
        return {
          word: rawWord,
          pos: g.pos,
          phonetic: g.phonetic,
          definition: `${c.rule} "${c.stem}": ${g.definition}`,
          example: g.example,
          saudiContext: g.saudiContext || null,
          unit: null,
          topic: 'Reading Passage Vocabulary',
          isCore: false,
          root: c.stem
        };
      }
    }

    // 4. Reverse Inflection Stemming (Checking if plural/participle form exists)
    const reverseCandidates = [
      { stem: clean + 's', rule: 'Singular / base form of' },
      { stem: clean + 'es', rule: 'Singular / base form of' },
      { stem: clean + 'ed', rule: 'Base verb form of' },
      { stem: clean + 'd', rule: 'Base verb form of' },
      { stem: clean + 'ing', rule: 'Base verb form of' }
    ];

    for (const rc of reverseCandidates) {
      if (DATA.readingGlossary && DATA.readingGlossary[rc.stem]) {
        const g = DATA.readingGlossary[rc.stem];
        return {
          word: rawWord,
          pos: g.pos,
          phonetic: g.phonetic,
          definition: `${rc.rule} "${rc.stem}": ${g.definition}`,
          example: g.example,
          saudiContext: g.saudiContext || null,
          unit: null,
          topic: 'Reading Passage Vocabulary',
          isCore: false,
          root: rc.stem
        };
      }
      const vMatch = DATA.vocabulary.find(v => v.word.toLowerCase().replace(/[^a-z0-9]/g, '') === rc.stem);
      if (vMatch) {
        return {
          word: rawWord,
          pos: vMatch.pos,
          phonetic: vMatch.phonetic,
          definition: `${rc.rule} "${vMatch.word}": ${vMatch.definition}`,
          example: vMatch.example,
          saudiContext: vMatch.saudiContext || null,
          unit: vMatch.unit,
          topic: vMatch.topic,
          isCore: true,
          root: vMatch.word
        };
      }
    }

    // 5. Synthesized fallback
    return {
      word: rawWord,
      pos: 'Vocabulary Term',
      phonetic: `/${clean}/`,
      definition: 'English vocabulary term used in context within the reading passage.',
      example: 'Observe how this word functions within the complete sentence.',
      saudiContext: null,
      unit: null,
      topic: 'Contextual Word',
      isCore: false,
      root: null
    };
  }

  // Interactive Word Popup Function
  window.showWordMeaning = function(wordId, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Pause reading audio so student can explore the word without clashing sound
    if (state.isReadingPlaying) {
      stopCurrentAudio();
    }

    const wordElem = document.getElementById(wordId);
    if (!wordElem) return;

    const rawWord = wordElem.getAttribute('data-word') || wordElem.innerText.trim();
    const cleanWord = rawWord.replace(/[^a-zA-Z0-9]/g, '');
    const displayText = wordElem.innerText.trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');

    const meaning = lookupWordMeaning(displayText || cleanWord);
    if (!meaning) return;

    // Locate parent sentence
    const parentSentence = wordElem.closest('.sentence-span');
    const sentenceId = parentSentence ? parentSentence.id : null;

    // Highlight the clicked word gently
    document.querySelectorAll('.word-span-selected').forEach(el => el.classList.remove('word-span-selected'));
    wordElem.classList.add('word-span-selected');

    // Build modal content
    const modal = document.getElementById('wordMeaningModal');
    const card = document.getElementById('wordMeaningCard');
    if (!modal || !card) return;

    card.innerHTML = `
      <div class="word-popup-header">
        <div class="word-popup-title-area">
          <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
            <h3 class="word-popup-term">${displayText || meaning.word}</h3>
            ${meaning.phonetic ? `<span class="word-popup-phonetic">${meaning.phonetic}</span>` : ''}
          </div>
          <div class="word-popup-badges" style="margin-top:0.45rem;">
            <span class="word-badge-pos">${meaning.pos}</span>
            ${meaning.isCore ? `<span class="word-badge-core">⭐ Super Goal 3 Core Vocabulary (Unit ${meaning.unit})</span>` : ''}
            ${meaning.root ? `<span class="word-badge-root">Base Form: <strong>${meaning.root}</strong></span>` : ''}
          </div>
        </div>
        <button class="word-popup-close" onclick="closeWordMeaningPopup()" title="Close definition popup">✕</button>
      </div>

      <div class="word-popup-body">
        <div>
          <div class="word-popup-section-label">English Definition:</div>
          <p class="word-popup-definition">${meaning.definition}</p>
        </div>

        <div>
          <div class="word-popup-section-label">Contextual Example:</div>
          <div class="word-popup-example-box">
            "${meaning.example}"
          </div>
        </div>

        ${meaning.saudiContext ? `
          <div>
            <div class="word-popup-section-label">Saudi Cultural Heritage & Context:</div>
            <div class="word-popup-saudi-box">
              🇸🇦 <strong>Cultural Note:</strong> ${meaning.saudiContext}
            </div>
          </div>
        ` : ''}
      </div>

      <div class="word-popup-actions">
        <button class="word-popup-btn-speak" onclick="speakText('${(displayText || meaning.word).replace(/'/g, "\'")}')">
          <span>🔊</span> Listen to Word
        </button>
        ${sentenceId ? `
          <button class="word-popup-btn-sentence" onclick="closeWordMeaningPopup(); playSingleSentence('${sentenceId}')">
            <span>▶</span> Play Full Sentence
          </button>
        ` : ''}
      </div>
    `;

    modal.classList.add('active');
    playSound('pop');
    addXP(1);
  };

  window.closeWordMeaningPopup = function() {
    const modal = document.getElementById('wordMeaningModal');
    if (modal) {
      modal.classList.remove('active');
    }
    document.querySelectorAll('.word-span-selected').forEach(el => el.classList.remove('word-span-selected'));
  };

  window.handleWordModalBackdropClick = function(event) {
    if (event.target && event.target.id === 'wordMeaningModal') {
      closeWordMeaningPopup();
    }
  };

  // Keyboard accessibility: Escape key closes word popup
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeWordMeaningPopup();
    }
  });

  function renderReadingLounge() {
    const container = document.getElementById('reading-stories-content');
    if (!container) return;

    const currentStory = DATA.readingStories.find(s => s.id === state.currentReadingStoryId) || DATA.readingStories[0];

    const storySwitcherHtml = `
      <div class="section-unit-switcher">
        <div class="unit-switcher-label">
          <span>🧭</span>
          <strong>Reading Passage Unit Selector:</strong>
        </div>
        <div class="unit-switcher-buttons">
          ${DATA.readingStories.map(s => `
            <button class="section-unit-pill ${s.id === currentStory.id ? 'active' : ''}" onclick="selectStory('${s.id}')">
              ${s.unit === 1 ? '📘' : (s.unit === 2 ? '📗' : (s.unit === 3 ? '✈️' : '🛒'))} Unit ${s.unit}: ${s.title}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    const galleryHtml = currentStory.gallery.map(g => `
      <div class="gallery-card" onclick="openImageViewer('${g.image}', '${g.caption}')">
        <img src="${g.image}" alt="${g.caption}">
        <div class="gallery-caption">
          ${g.caption}
          <div style="margin-top:0.35rem; font-weight:700; color:var(--primary-coral-dark); font-size:0.75rem;">🔍 Click to enlarge in HD</div>
        </div>
      </div>
    `).join('');

    const quizHtml = currentStory.comprehensionQuestions.map((q, idx) => `
      <div class="diag-question-item" style="margin-bottom:1.35rem;">
        <span class="visual-clue-badge">📖 Reading Comprehension Check</span>
        <p class="diag-question-text">${idx + 1}. ${q.question}</p>
        <div class="diag-options-grid">
          ${q.options.map((opt, optIdx) => `
            <button class="diag-opt-btn" onclick="checkReadingQuiz('${currentStory.id}', ${idx}, ${optIdx}, this)">
              ${String.fromCharCode(65 + optIdx)}. ${opt}
            </button>
          `).join('')}
        </div>
        <div class="diag-explanation" id="read_exp_${currentStory.id}_${idx}">
          <strong>Explanation:</strong> ${q.explanation}
        </div>
      </div>
    `).join('');

    // Transform passage into highlighted sentence/word structure with interactive click support
    let wordCounter = 0;
    let sentenceCounter = 0;
    const structuredPassageHtml = currentStory.passage.split('\n\n').map(pText => {
      const sentences = pText.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) || [pText];
      const sentSpans = sentences.map(sText => {
        const sId = `sent_${sentenceCounter++}`;
        const words = sText.trim().split(/\s+/);
        const wordSpans = words.map(w => {
          const wId = `w_${wordCounter++}`;
          const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
          return `<span class="word-span" id="${wId}" data-word="${clean}" onclick="showWordMeaning('${wId}', event)" title="Click to view definition, IPA phonetics & audio">${w}</span>`;
        }).join(' ');
        return `<span class="sentence-span" id="${sId}" onclick="playSingleSentence('${sId}')" title="Click to listen to this sentence">${wordSpans}</span>`;
      }).join(' ');
      return `<p style="margin-bottom:1.35rem;">${sentSpans}</p>`;
    }).join('');

    const voiceLabel = state.deepgramApiKey 
      ? `🎙️ Deepgram Aura American Voice (${state.deepgramVoice.replace('aura-', '').replace('-en', '')})`
      : '🎙️ Enhanced Natural American Voice (HD)';

    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Reading Stories Lounge & Deepgram Voice Studio</h2>
          <p>Read authentic textbook passages with authentic human American pronunciation, 75% slow speed control, and synchronized real-time highlighting.</p>
        </div>
      </div>

      ${storySwitcherHtml}

      <div class="story-container">
        <div class="story-header">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
            <div>
              <span class="brand-badge">Unit ${currentStory.unit} Reading</span>
              <h3 style="margin-top:0.35rem;">${currentStory.title}</h3>
              <p class="sub">${currentStory.subtitle}</p>
            </div>
            <button class="btn btn-secondary" onclick="openDeepgramModal()" style="background:var(--bg-alt); border:1.5px solid var(--border-color); padding:0.55rem 1rem; border-radius:var(--radius-sm); font-weight:800; cursor:pointer;">
              ⚙️ Voice Settings
            </button>
          </div>
        </div>

        <!-- Interactive Audio Player Bar with 75% Speed Toggle -->
        <div class="reading-player-controls">
          <div class="player-btn-group">
            <button class="btn-read-play" id="playHighlightBtn" onclick="toggleReadingPassageHighlight('${currentStory.id}')">
              ▶ Read with Live Highlighting
            </button>
            <button class="btn-read-speed ${state.speechRate === 0.75 ? 'speed-slow' : ''}" id="readingSpeedToggleBtn" onclick="toggleSpeechRate()" title="Toggle Reading Speed (75% Slow vs 100% Normal)">
              ${state.speechRate === 0.75 ? '🐢 Speed: 75% (Slow)' : '⚡ Speed: 100% (Normal)'}
            </button>
            <button class="btn-read-stop" onclick="stopCurrentAudio()" title="Stop Audio Playback">
              ⏹ Stop
            </button>
          </div>

          <div class="voice-status-indicator">
            <span class="voice-badge-active">${voiceLabel}</span>
            <div class="audio-visualizer-wave">
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
              <div class="wave-bar"></div>
            </div>
          </div>
        </div>

        <!-- Interactive Vocabulary Tip Pill -->
        <div style="margin-bottom:0.85rem; display:flex; align-items:center; gap:0.55rem; background:#fff7ed; border:1px solid #fed7aa; color:#9a3412; padding:0.5rem 1.1rem; border-radius:999px; font-size:0.85rem; font-weight:700; box-shadow:0 1px 3px rgba(231,113,63,0.08); width:fit-content;">
          <span>💡</span> <strong>Interactive Vocabulary:</strong> Click any word in the passage to view its instant definition, IPA phonetics, and audio!
        </div>

        <!-- Highlightable Passage Canvas -->
        <div class="story-passage-box reading-passage-highlightable" id="highlightableCanvas">
          ${structuredPassageHtml}
        </div>

        <!-- Thematic Gallery -->
        <div class="reading-gallery">
          <h4>📸 Photographic Documentation from Student's Book:</h4>
          <div class="gallery-grid">
            ${galleryHtml}
          </div>
        </div>

        <!-- Comprehension Quiz -->
        <div class="diagnostic-bench" style="margin-top:2.25rem;">
          <h4>🎯 Reading Comprehension & Inferential Analysis (5 Questions)</h4>
          ${quizHtml}
        </div>
      </div>
    `;
  }

  window.selectStory = function(storyId) {
    stopCurrentAudio();
    state.currentReadingStoryId = storyId;
    renderReadingLounge();
  };

  // Synchronized Highlighting Player Logic with Zero-Lag Engine
  window.toggleReadingPassageHighlight = function(storyId) {
    if (state.isReadingPlaying) {
      stopCurrentAudio();
      return;
    }

    const story = DATA.readingStories.find(s => s.id === storyId);
    if (!story) return;

    stopCurrentAudio();
    state.isReadingPlaying = true;
    setEqualizerAnimating(true);
    addXP(10);

    const playBtn = document.getElementById('playHighlightBtn');
    if (playBtn) playBtn.innerHTML = '⏸ Pause Reading';

    const cleanPassageText = story.passage.replace(/\n\n/g, ' ');

    // 1. Deepgram Mode (if API key is present)
    if (state.deepgramApiKey) {
      if (playBtn) playBtn.innerHTML = '⏳ Loading American Audio...';
      fetchDeepgramAudio(cleanPassageText, state.deepgramVoice).then(audioUrl => {
        if (!state.isReadingPlaying) return;
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          state.currentAudioObject = audio;
          audio.playbackRate = state.speechRate;
          audio.preservesPitch = true;

          if (playBtn) playBtn.innerHTML = '⏸ Pause Reading';

          const allWordSpans = Array.from(document.querySelectorAll('#highlightableCanvas .word-span'));
          const wordTimeline = buildWordTimeline(allWordSpans);

          audio.onplay = () => {
            startAudioTimeSync(audio, wordTimeline);
          };

          audio.onended = () => {
            stopCurrentAudio();
            addXP(15);
          };

          audio.onerror = () => {
            playSentenceChainedSpeech(0);
          };

          audio.play().catch(() => {
            playSentenceChainedSpeech(0);
          });
          return;
        }
        playSentenceChainedSpeech(0);
      });
    } else {
      // 2. High-Performance Sentence-Chained American Speech (Zero Delay)
      playSentenceChainedSpeech(0);
    }
  };

  window.checkReadingQuiz = function(storyId, qIdx, optIdx, btnElem) {
    const story = DATA.readingStories.find(s => s.id === storyId);
    if (!story) return;
    const q = story.comprehensionQuestions[qIdx];
    const parent = btnElem.closest('.diag-question-item');
    parent.querySelectorAll('.diag-opt-btn').forEach((b, i) => {
      b.disabled = true;
      if (i === q.correctAnswer) b.classList.add('correct');
      if (i === optIdx && i !== q.correctAnswer) b.classList.add('incorrect');
    });

    if (optIdx === q.correctAnswer) {
      playSound('correct');
      addXP(15);
    } else {
      playSound('click');
    }

    const expDiv = document.getElementById(`read_exp_${storyId}_${qIdx}`);
    if (expDiv) expDiv.style.display = 'block';
  };

  // ==========================================================================
  // 6. WRITING MASTER STUDIO
  // ==========================================================================
  function renderWritingStudio() {
    const container = document.getElementById('writing-studio-content');
    if (!container) return;

    const currentTask = DATA.writingLab.tasks.find(t => t.id === state.currentWritingTaskId) || DATA.writingLab.tasks[0];

    const taskSwitcherHtml = `
      <div class="section-unit-switcher">
        <div class="unit-switcher-label">
          <span>🧭</span>
          <strong>Writing Studio Task Navigation:</strong>
        </div>
        <div class="unit-switcher-buttons">
          ${DATA.writingLab.tasks.map(t => `
            <button class="section-unit-pill ${t.id === currentTask.id ? 'active' : ''}" onclick="selectWritingTask('${t.id}')">
              ${t.unit === 1 ? '📘' : (t.unit === 2 ? '📗' : (t.unit === 3 ? '✈️' : '🛒'))} Unit ${t.unit} Task: ${t.title}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2>${DATA.writingLab.title}</h2>
          <p>${DATA.writingLab.overview}</p>
        </div>
      </div>

      ${taskSwitcherHtml}

      <div class="writing-task-card">
        <span class="brand-badge">Unit ${currentTask.unit} Task</span>
        <h3 style="font-family:'Outfit',sans-serif; font-size:1.45rem; color:var(--accent-slate-dark); margin:0.4rem 0 0.75rem;">
          ${currentTask.title}
        </h3>
        <p style="font-size:0.96rem; color:var(--text-main); margin-bottom:1.35rem;"><strong>Prompt:</strong> ${currentTask.prompt}</p>

        <div style="background:var(--bg-main); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:1.15rem; margin-bottom:1.5rem;">
          <h4 style="font-size:0.9rem; text-transform:uppercase; color:var(--accent-charcoal); margin-bottom:0.5rem; font-weight:800;">Writing Guidelines:</h4>
          <ul style="padding-left:1.25rem; font-size:0.9rem; color:var(--text-muted); display:flex; flex-direction:column; gap:0.35rem;">
            ${currentTask.guidelines.map(g => `<li>${g}</li>`).join('')}
          </ul>
        </div>

        <details style="background:var(--primary-coral-subtle); border:1px solid var(--primary-coral-light); border-radius:var(--radius-sm); padding:1.15rem; margin-bottom:1.5rem;">
          <summary style="font-weight:800; color:var(--primary-coral-deep); cursor:pointer;">
            📖 View Official Model Written Submission
          </summary>
          <pre style="white-space:pre-wrap; font-family:inherit; font-size:0.92rem; line-height:1.65; color:var(--text-main); margin-top:0.85rem; background:#ffffff; padding:1.15rem; border-radius:var(--radius-sm); border:1px solid var(--border-color);">${currentTask.modelText}</pre>
        </details>

        <div class="writing-editor-box">
          <label style="font-weight:800; font-size:0.95rem; display:block; margin-bottom:0.4rem;">
            ✍️ Interactive Student Writing & Analysis Canvas:
          </label>
          <textarea class="writing-textarea" id="studentEssayInput" placeholder="Compose your written draft here..."></textarea>
          <div class="writing-stats-row">
            <span>Words: <strong id="essayWordCount">0</strong></span>
            <span>Characters: <strong id="essayCharCount">0</strong></span>
            <span>Target Keywords Detected: <strong id="essayKeywordCount">0</strong></span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.35rem;">
          <button class="writing-evaluate-btn" id="evaluateEssayBtn">
            ⚡ Evaluate My Writing Instantly
          </button>
        </div>

        <div id="writingFeedbackContainer" style="margin-top:1.5rem; display:none;"></div>
      </div>
    `;

    const textarea = document.getElementById('studentEssayInput');
    const wordCountSpan = document.getElementById('essayWordCount');
    const charCountSpan = document.getElementById('essayCharCount');
    const kwCountSpan = document.getElementById('essayKeywordCount');

    if (textarea) {
      textarea.addEventListener('input', () => {
        const text = textarea.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        const chars = text.length;

        let detectedKws = 0;
        currentTask.evaluatorKeywords.forEach(kw => {
          if (text.toLowerCase().includes(kw.toLowerCase())) detectedKws++;
        });

        if (wordCountSpan) wordCountSpan.textContent = words;
        if (charCountSpan) charCountSpan.textContent = chars;
        if (kwCountSpan) kwCountSpan.textContent = `${detectedKws} / ${currentTask.evaluatorKeywords.length}`;
      });
    }

    const evalBtn = document.getElementById('evaluateEssayBtn');
    if (evalBtn) {
      evalBtn.addEventListener('click', () => {
        const text = textarea ? textarea.value.trim() : '';
        const words = text ? text.split(/\s+/).length : 0;
        const feedbackContainer = document.getElementById('writingFeedbackContainer');

        if (words < 20) {
          alert('Please write at least 20 words before requesting automated evaluation.');
          return;
        }

        let detectedKws = 0;
        const foundList = [];
        currentTask.evaluatorKeywords.forEach(kw => {
          if (text.toLowerCase().includes(kw.toLowerCase())) {
            detectedKws++;
            foundList.push(kw);
          }
        });

        const kwScore = Math.min(100, Math.round((detectedKws / currentTask.evaluatorKeywords.length) * 100));
        const lengthScore = words >= 50 ? 100 : Math.round((words / 50) * 100);
        const overallScore = Math.round((kwScore * 0.5) + (lengthScore * 0.5));

        playSound('correct');
        addXP(30);

        feedbackContainer.style.display = 'block';
        feedbackContainer.innerHTML = `
          <div style="background:var(--bg-main); border:2px solid var(--primary-coral); border-radius:var(--radius-md); padding:1.65rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.15rem;">
              <h4 style="font-family:'Outfit',sans-serif; font-size:1.3rem; color:var(--accent-slate-dark);">
                📝 Automated Writing Evaluation Report
              </h4>
              <span class="brand-badge" style="font-size:0.9rem; padding:0.35rem 0.9rem;">Overall Score: ${overallScore}%</span>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:1rem; margin-bottom:1.35rem;">
              <div class="card" style="padding:0.85rem;">
                <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-light); font-weight:800;">Word Count Rating</span>
                <strong style="color:var(--primary-coral-dark); font-size:1.25rem;">${words} Words (${lengthScore}%)</strong>
              </div>
              <div class="card" style="padding:0.85rem;">
                <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-light); font-weight:800;">Curriculum Lexicon</span>
                <strong style="color:var(--primary-coral-dark); font-size:1.25rem;">${detectedKws} / ${currentTask.evaluatorKeywords.length} Target Words</strong>
              </div>
            </div>
            <p style="font-size:0.92rem; color:var(--text-main); margin-bottom:0.85rem;">
              <strong>Detected Target Concepts:</strong> ${foundList.length > 0 ? foundList.join(', ') : 'None yet.'}
            </p>
            <div style="background:#ffffff; border-left:3.5px solid var(--success); padding:0.95rem; border-radius:0 var(--radius-sm) var(--radius-sm) 0; font-size:0.88rem;">
              <strong>Teacher Mahmoud Al-Saeed Feedback:</strong> Your response demonstrates clear communicative competence. Maintain accurate punctuation, capitalize proper nouns (such as <em>Riyadh</em>, <em>S.A.Y.H.A.</em>, and <em>Saudi</em>), and connect ideas smoothly using connectors like <em>such as</em>, <em>because</em>, and <em>for example</em>.
            </div>
          </div>
        `;
      });
    }
  }

  window.selectWritingTask = function(taskId) {
    state.currentWritingTaskId = taskId;
    renderWritingStudio();
  };

  // ==========================================================================
  // 7. DISCUSSION ARENA
  // ==========================================================================
  function renderDiscussionArena() {
    const container = document.getElementById('discussions-content');
    if (!container) return;

    const filter = state.discussionFilter || state.selectedUnit || 'all';
    const discsToRender = DATA.discussions.filter(d => {
      if (filter === 'all') return true;
      return d.unit === parseInt(filter, 10);
    });

    let currentDisc = DATA.discussions.find(d => d.id === state.currentDiscussionId);
    if (!currentDisc || !discsToRender.some(d => d.id === currentDisc.id)) {
      currentDisc = discsToRender[0] || DATA.discussions[0];
      state.currentDiscussionId = currentDisc.id;
    }

    const switcherHtml = `
      <div class="section-unit-switcher">
        <div class="unit-switcher-label">
          <span>🧭</span>
          <strong>Discussion Arena Unit Focus:</strong>
        </div>
        <div class="unit-switcher-buttons">
          <button class="section-unit-pill ${filter === 'all' ? 'active' : ''}" onclick="filterDiscussionUnit('all')">
            🌟 All Scenarios (1–12)
          </button>
          <button class="section-unit-pill ${filter === 1 || filter === '1' ? 'active' : ''}" onclick="filterDiscussionUnit(1)">
            📘 Unit 1: Lifestyles (1–3)
          </button>
          <button class="section-unit-pill ${filter === 2 || filter === '2' ? 'active' : ''}" onclick="filterDiscussionUnit(2)">
            📗 Unit 2: Life Stories (4–6)
          </button>
          <button class="section-unit-pill ${filter === 3 || filter === '3' ? 'active' : ''}" onclick="filterDiscussionUnit(3)">
            ✈️ Unit 3: Travel (7–9)
          </button>
          <button class="section-unit-pill ${filter === 4 || filter === '4' ? 'active' : ''}" onclick="filterDiscussionUnit(4)">
            🛒 Unit 4: Food & Dining (10–12)
          </button>
        </div>
      </div>
    `;

    const discTabsHtml = `
      <div style="display:flex; flex-wrap:wrap; gap:0.55rem; margin-bottom:1.5rem;">
        ${discsToRender.map(d => `
          <button class="section-unit-pill ${d.id === currentDisc.id ? 'active' : ''}" onclick="selectDiscussion('${d.id}')">
            ${d.unit === 1 ? '📘' : (d.unit === 2 ? '📗' : (d.unit === 3 ? '✈️' : '🛒'))} ${d.title.split(':')[0]}
          </button>
        `).join('')}
      </div>
    `;

    const dialogueHtml = currentDisc.sampleDialogue.map(dl => `
      <div style="display:flex; gap:0.85rem; margin-bottom:0.95rem; align-items:flex-start;">
        <span class="brand-badge-secondary" style="font-size:0.75rem; padding:0.25rem 0.65rem; min-width:115px; text-align:center;">
          ${dl.speaker}
        </span>
        <div style="background:#ffffff; border:1px solid var(--border-color); padding:0.75rem 1.15rem; border-radius:var(--radius-sm); font-size:0.92rem; flex:1;">
          ${dl.text}
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Interactive Communicative Discussion Arena</h2>
          <p>Real-life communicative simulations at hotel desks, film studios, career interviews, sports venues, dining tables, and museum galleries.</p>
        </div>
      </div>

      ${switcherHtml}
      ${discTabsHtml}

      <div class="card" style="padding:2.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
          <div>
            <span class="brand-badge">Unit ${currentDisc.unit} Scenario</span>
            <h3 style="font-family:'Outfit',sans-serif; font-size:1.45rem; color:var(--accent-slate-dark); margin-top:0.35rem;">
              ${currentDisc.title}
            </h3>
          </div>
          <span class="badge-diff moderate">Communicative Simulation</span>
        </div>

        <div style="background:var(--primary-coral-subtle); border-left:3.5px solid var(--primary-coral); padding:0.95rem 1.15rem; border-radius:0 var(--radius-sm) var(--radius-sm) 0; margin-bottom:1.65rem; font-size:0.95rem;">
          <strong>Context:</strong> ${currentDisc.context}<br>
          <strong>Your Mission:</strong> ${currentDisc.prompt}
        </div>

        <div style="background:var(--bg-main); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.35rem; margin-bottom:1.65rem;">
          <h4 style="font-size:0.95rem; color:var(--accent-charcoal); margin-bottom:0.95rem; font-weight:800;">💬 Scripted Dialogue Role-Play:</h4>
          ${dialogueHtml}
        </div>

        <div style="margin-bottom:1.65rem;">
          <label style="font-weight:800; font-size:0.95rem; display:block; margin-bottom:0.4rem;">
            🎙️ Formulate Your Response as ${state.studentName}:
          </label>
          <textarea class="writing-textarea" id="studentDiscInput" placeholder="Speak as the student in this dialogue..."></textarea>
          <div style="margin-top:0.55rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
            ${currentDisc.recommendedPhrases.map(ph => `
              <span class="vocab-pos-badge" style="background:var(--primary-coral-light); color:var(--primary-coral-deep); cursor:pointer; font-weight:700;" onclick="insertPhrase('${ph}')">
                + "${ph}"
              </span>
            `).join('')}
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <button class="writing-evaluate-btn" onclick="revealModelAnswer()">
            💡 Reveal Model Teacher Response
          </button>
        </div>

        <div id="modelAnswerBox" style="display:none; margin-top:1.35rem; background:#ffffff; border-left:3.5px solid var(--success); padding:1.15rem; border-radius:0 var(--radius-sm) var(--radius-sm) 0; font-size:0.96rem;">
          <strong>Ideal Model Answer:</strong><br>
          "${currentDisc.modelAnswer}"
          <div style="margin-top:0.65rem;">
            <button class="audio-btn" onclick="speakText('${currentDisc.modelAnswer.replace(/'/g, "\\'")}')" title="Listen with Deepgram American Voice">🔊 Listen to Model Response</button>
          </div>
        </div>
      </div>
    `;
  }

  window.selectDiscussion = function(discId) {
    state.currentDiscussionId = discId;
    renderDiscussionArena();
  };

  window.filterDiscussionUnit = function(unitVal) {
    state.discussionFilter = unitVal;
    if (unitVal === 1 && !['u1_d1', 'u1_d2', 'u1_d3'].includes(state.currentDiscussionId)) {
      state.currentDiscussionId = 'u1_d1';
    } else if (unitVal === 2 && !['u2_d1', 'u2_d2', 'u2_d3'].includes(state.currentDiscussionId)) {
      state.currentDiscussionId = 'u2_d1';
    } else if (unitVal === 3 && !['u3_d1', 'u3_d2', 'u3_d3'].includes(state.currentDiscussionId)) {
      state.currentDiscussionId = 'u3_d1';
    } else if (unitVal === 4 && !['u4_d1', 'u4_d2', 'u4_d3'].includes(state.currentDiscussionId)) {
      state.currentDiscussionId = 'u4_d1';
    }
    renderDiscussionArena();
    playSound('click');
  };

  window.insertPhrase = function(phrase) {
    const input = document.getElementById('studentDiscInput');
    if (input) {
      input.value += (input.value ? ' ' : '') + phrase;
      input.focus();
      playSound('click');
    }
  };

  window.revealModelAnswer = function() {
    const box = document.getElementById('modelAnswerBox');
    if (box) {
      box.style.display = 'block';
      playSound('correct');
      addXP(10);
    }
  };

  // ==========================================================================
  // 8. EXAMINATION SUITE & RUNNER
  // ==========================================================================
  function renderExamSuite() {
    const grid = document.getElementById('exam-cards-grid');
    const runner = document.getElementById('exam-runner-container');
    if (!grid || !runner) return;

    if (state.activeExam) {
      grid.style.display = 'none';
      runner.style.display = 'block';
      renderActiveExam();
      return;
    }

    grid.style.display = 'grid';
    runner.style.display = 'none';

    const curExamFilter = state.examFilter || 'all';
    const examsToRender = DATA.exams.filter(ex => {
      if (curExamFilter === 'term1') return ex.unit === '1-4' || ex.id === 'exam_22';
      if (curExamFilter === 'tri') return ex.unit === '1-3' || ex.id === 'exam_21';
      if (curExamFilter === 'u1') return ex.unit === 1;
      if (curExamFilter === 'u2') return ex.unit === 2;
      if (curExamFilter === 'u3') return ex.unit === 3;
      if (curExamFilter === 'u4') return ex.unit === 4;
      return true;
    });

    grid.innerHTML = examsToRender.map(ex => `
      <div class="exam-card">
        <div class="exam-card-header">
          <div>
            <span class="brand-badge">Exam ${ex.id.replace('exam_', '')}</span>
            <h3 style="margin-top:0.35rem;">${ex.title}</h3>
          </div>
          <span class="badge-diff ${ex.difficulty.toLowerCase()}">${ex.difficulty}</span>
        </div>
        <p>${ex.description}</p>
        <div class="exam-meta-row">
          <span>📝 <strong>${ex.questions.length}</strong> Questions</span>
          <span>⏱️ <strong>${ex.durationMinutes}</strong> Minutes</span>
          <span>🎯 Target: <strong>${typeof ex.unit === 'number' ? 'Unit ' + ex.unit : ex.unit}</strong></span>
        </div>
        <div style="display:flex; gap:0.65rem; margin-top:auto;">
          <button class="start-exam-btn" style="flex:1;" onclick="startExam('${ex.id}', 'timed')">
            ⏱️ Start Timed Exam
          </button>
          <button class="start-exam-btn" style="flex:1; background:var(--accent-charcoal);" onclick="startExam('${ex.id}', 'practice')">
            🧪 Practice Mode
          </button>
        </div>
      </div>
    `).join('');
  }

  
  window.filterExams = function(filterVal, btnElem) {
    state.examFilter = filterVal;
    document.querySelectorAll('#examFilterBar .vocab-filter-btn').forEach(b => b.classList.remove('active'));
    if (btnElem) btnElem.classList.add('active');
    renderExamSuite();
  };

  window.startExam = function(examId, mode) {
    const exam = DATA.exams.find(e => e.id === examId);
    if (!exam) return;

    state.activeExam = exam;
    state.examMode = mode;
    state.examCurrentQuestionIndex = 0;
    state.examUserAnswers = {};
    state.examEncouragements = {};
    state.examStreak = 0;
    state.examBestStreak = 0;
    state.examSecondsRemaining = exam.durationMinutes * 60;
    state.examTotalDuration = exam.durationMinutes * 60;

    if (state.examTimerInterval) clearInterval(state.examTimerInterval);

    state.examTimerInterval = setInterval(() => {
      if (state.examMode === 'timed') {
        state.examSecondsRemaining--;
        updateTimerDisplay();
        if (state.examSecondsRemaining <= 0) {
          clearInterval(state.examTimerInterval);
          alert('Time is up! Submitting your examination automatically.');
          finishExam();
        }
      } else {
        state.examSecondsRemaining++;
        updateTimerDisplay();
      }
    }, 1000);

    renderExamSuite();
  };

  function updateTimerDisplay() {
    const timerElem = document.getElementById('activeExamTimer');
    if (!timerElem) return;

    if (state.examMode === 'timed') {
      const remaining = Math.max(0, state.examSecondsRemaining);
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

      let urgencyClass = '';
      let icon = '⏱️';
      if (remaining <= 120) {
        urgencyClass = 'timer-critical';
        icon = '🚨';
      } else if (remaining <= 300) {
        urgencyClass = 'timer-warning';
        icon = '⚠️';
      }

      timerElem.className = `exam-timer ${urgencyClass}`.trim();
      timerElem.innerHTML = `<span class="timer-icon">${icon}</span> <span class="timer-digits">${formatted}</span>`;
    } else {
      const elapsed = state.examSecondsRemaining;
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      timerElem.className = 'exam-timer';
      timerElem.innerHTML = `<span class="timer-icon">⏱️</span> <span>Practice: ${formatted}</span>`;
    }
  }

  function renderActiveExam() {
    const runner = document.getElementById('exam-runner-container');
    if (!runner || !state.activeExam) return;

    const ex = state.activeExam;
    const qIndex = state.examCurrentQuestionIndex;
    const q = ex.questions[qIndex];
    const totalQ = ex.questions.length;
    const progressPct = Math.round(((qIndex + 1) / totalQ) * 100);

    const isAnswered = state.examUserAnswers.hasOwnProperty(qIndex);
    const selectedOpt = isAnswered ? state.examUserAnswers[qIndex] : null;

    // Score calculations
    const answeredCount = Object.keys(state.examUserAnswers).length;
    let liveScore = 0;
    ex.questions.forEach((qu, i) => {
      if (state.examUserAnswers[i] === qu.correctAnswer) {
        liveScore++;
      }
    });

    const enc = state.examEncouragements[qIndex];

    runner.innerHTML = `
      <div class="exam-runner">
        <div class="exam-runner-header">
          <div>
            <span class="brand-badge">Exam in Progress • ${state.examMode === 'timed' ? '⏱️ Timed Mode' : '🧪 Practice Mode'}</span>
            <h3 style="font-family:'Outfit',sans-serif; font-size:1.45rem; color:var(--accent-slate-dark); margin-top:0.35rem;">
              ${ex.title}
            </h3>
          </div>
          <div class="exam-runner-hud">
            <div class="exam-score-pill" title="Live Score: Correct answers out of answered questions">
              <span>⭐</span>
              <span>Score: <strong>${liveScore}</strong> / ${answeredCount}</span>
            </div>
            ${state.examStreak > 0 ? `
              <div class="exam-streak-pill ${state.examStreak >= 3 ? 'on-fire' : ''}" title="Consecutive Correct Answers">
                <span>🔥</span>
                <span>Streak: <strong>${state.examStreak}</strong></span>
              </div>
            ` : ''}
            <div class="exam-timer" id="activeExamTimer">--:--</div>
            <button class="btn btn-secondary" onclick="exitExamConfirm()" style="background:var(--bg-alt); border:1px solid var(--border-color); padding:0.5rem 0.95rem; border-radius:var(--radius-sm); font-weight:800; cursor:pointer;">
              ✕ Exit
            </button>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; font-size:0.88rem; font-weight:800; color:var(--text-muted); margin-bottom:0.4rem;">
          <span>Candidate: <strong>${state.studentName}</strong> • Question ${qIndex + 1} of ${totalQ}</span>
          <span>Progress: ${progressPct}%</span>
        </div>
        <div class="exam-progress-bar-wrap">
          <div class="exam-progress-bar-fill" style="width:${progressPct}%;"></div>
        </div>

        <!-- Dynamic Encouragement Cheer Banner -->
        ${isAnswered && enc ? `
          <div class="exam-encouragement-banner ${enc.type}">
            <span style="font-size:1.75rem; line-height:1;">${enc.type === 'streak' ? '🔥' : (enc.type === 'correct' ? '🌟' : '💡')}</span>
            <div>
              <div class="encouragement-title">${enc.title}</div>
              <div class="encouragement-msg">${enc.msg}</div>
            </div>
          </div>
        ` : ''}

        <!-- Question Box -->
        <div class="exam-q-box">
          ${q.visualClue ? `<span class="visual-clue-badge" style="margin-bottom:0.6rem; display:inline-block;">${q.visualClue}</span>` : ''}
          <h4 class="exam-q-title">${qIndex + 1}. ${q.question}</h4>
          <div class="exam-options-list">
            ${q.options.map((opt, optIdx) => {
              const isSelected = selectedOpt === optIdx;
              const isThisCorrect = optIdx === q.correctAnswer;
              let extraClass = '';
              let statusBadge = '';

              if (isAnswered) {
                if (isThisCorrect) {
                  extraClass = 'correct';
                  statusBadge = `<span class="exam-option-badge-status badge-correct">✓ Correct Answer</span>`;
                } else if (isSelected) {
                  extraClass = 'incorrect';
                  statusBadge = `<span class="exam-option-badge-status badge-incorrect">✕ Your Selection</span>`;
                } else {
                  extraClass = 'dimmed';
                }
              }

              return `
                <div class="exam-option-item ${extraClass}" onclick="${isAnswered ? '' : `selectExamAnswer(${qIndex}, ${optIdx})`}">
                  <div style="width:30px; height:30px; border-radius:50%; border:2px solid currentColor; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.88rem; flex-shrink:0;">
                    ${String.fromCharCode(65 + optIdx)}
                  </div>
                  <span style="flex:1;">${opt}</span>
                  ${statusBadge}
                </div>
              `;
            }).join('')}
          </div>

          <!-- Academic Rationale with Instant Feedback -->
          ${isAnswered ? `
            <div class="exam-academic-rationale">
              <div class="rationale-header">
                <span style="font-size:1.2rem;">📖</span>
                <span>Academic Rule & Pedagogical Rationale:</span>
              </div>
              <p class="rationale-text">${q.explanation}</p>
            </div>
          ` : ''}
        </div>

        <!-- Navigation Controls -->
        <div class="exam-nav-controls">
          <button class="flashcard-nav-btn" style="background:var(--bg-alt); color:var(--text-main); border:1px solid var(--border-color);" onclick="navExamQ(${qIndex - 1})" ${qIndex === 0 ? 'disabled' : ''}>
            ◀ Previous
          </button>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap; max-width:620px; justify-content:center;">
            ${ex.questions.map((quest, i) => {
              const isCur = i === qIndex;
              const hasAns = state.examUserAnswers.hasOwnProperty(i);
              const isAnsCorr = hasAns && state.examUserAnswers[i] === quest.correctAnswer;
              let bg = 'var(--bg-card)';
              let color = 'var(--text-muted)';
              let border = '1px solid var(--border-color)';

              if (hasAns) {
                if (isAnsCorr) {
                  bg = '#10b981';
                  color = '#ffffff';
                  border = '1px solid #059669';
                } else {
                  bg = '#ef4444';
                  color = '#ffffff';
                  border = '1px solid #dc2626';
                }
              }

              const curRing = isCur ? 'box-shadow: 0 0 0 2.5px var(--accent-gold), 0 3px 8px rgba(0,0,0,0.18); transform:scale(1.12); font-weight:900;' : '';

              return `
                <button onclick="navExamQ(${i})" title="Question ${i + 1}${hasAns ? (isAnsCorr ? ' (Correct)' : ' (Incorrect)') : ''}" style="width:34px; height:34px; border-radius:6px; font-weight:800; font-size:0.82rem; cursor:pointer; transition:all 0.2s; background:${bg}; color:${color}; border:${border}; ${curRing}">
                  ${i + 1}
                </button>
              `;
            }).join('')}
          </div>
          ${qIndex === totalQ - 1 || answeredCount === totalQ ? `
            <button class="writing-evaluate-btn" onclick="finishExam()">
              🏁 Finish & View Report
            </button>
          ` : `
            <button class="flashcard-nav-btn" onclick="navExamQ(${qIndex + 1})">
              Next ▶
            </button>
          `}
        </div>
      </div>
    `;

    updateTimerDisplay();
  }

  window.selectExamAnswer = function(qIdx, optIdx) {
    if (!state.activeExam) return;
    const ex = state.activeExam;
    const q = ex.questions[qIdx];
    if (!q) return;

    const isFirstAnswer = !state.examUserAnswers.hasOwnProperty(qIdx);
    state.examUserAnswers[qIdx] = optIdx;

    const isCorrect = (optIdx === q.correctAnswer);

    if (isCorrect) {
      if (isFirstAnswer) {
        state.examStreak++;
        if (state.examStreak > state.examBestStreak) {
          state.examBestStreak = state.examStreak;
        }
      }

      if (state.examStreak >= 3) {
        playSound('streak');
      } else {
        playSound('correct');
      }

      if (state.examStreak >= 5) {
        state.examEncouragements[qIdx] = {
          type: 'streak',
          title: `🔥 Champion Momentum! (${state.examStreak} In A Row!)`,
          msg: `Phenomenal performance! You have mastered 5 or more questions consecutively with zero errors!`
        };
      } else if (state.examStreak >= 3) {
        state.examEncouragements[qIdx] = {
          type: 'streak',
          title: `⚡ Hot Streak Activated! (${state.examStreak} In A Row!)`,
          msg: `Incredible accuracy! 3 consecutive correct answers! Keep this lightning-fast pace!`
        };
      } else if (state.examStreak === 2) {
        state.examEncouragements[qIdx] = {
          type: 'correct',
          title: '🌟 Outstanding! Two In A Row!',
          msg: 'Superb grammatical precision! You are maintaining an exceptional standard of accuracy.'
        };
      } else {
        const praises = [
          '🌟 Outstanding! Spot on! Perfect grammatical choice!',
          '✨ Excellent work! You identified the exact target structure!',
          '🎯 Bullseye! Great academic precision and attention to detail!',
          '👏 Well done! Demonstrating solid mastery of the lesson!'
        ];
        state.examEncouragements[qIdx] = {
          type: 'correct',
          title: '✨ Correct Answer!',
          msg: praises[qIdx % praises.length]
        };
      }
    } else {
      if (isFirstAnswer) {
        state.examStreak = 0;
      }
      playSound('incorrect');

      const growthMindset = [
        '💪 Great effort! Read the academic rationale below to solidify this concept.',
        '💡 Good try! Analyzing errors is how language mastery is truly achieved.',
        '🎯 Stay positive and focused! Check the explanation below and conquer the next question.',
        '🌱 Learning in action! Review the key clue below and bounce back stronger.'
      ];
      state.examEncouragements[qIdx] = {
        type: 'incorrect',
        title: '💡 Academic Learning Moment',
        msg: growthMindset[qIdx % growthMindset.length]
      };
    }

    renderActiveExam();
  };

  window.navExamQ = function(targetIdx) {
    if (!state.activeExam) return;
    if (targetIdx >= 0 && targetIdx < state.activeExam.questions.length) {
      state.examCurrentQuestionIndex = targetIdx;
      renderActiveExam();
    }
  };

  window.exitExamConfirm = function() {
    if (confirm('Are you sure you want to exit this examination? Your ongoing progress will be reset.')) {
      if (state.examTimerInterval) clearInterval(state.examTimerInterval);
      state.activeExam = null;
      renderExamSuite();
    }
  };

  window.finishExam = function() {
    if (state.examTimerInterval) clearInterval(state.examTimerInterval);
    const ex = state.activeExam;
    const totalQ = ex.questions.length;
    let score = 0;

    ex.questions.forEach((q, i) => {
      if (state.examUserAnswers[i] === q.correctAnswer) {
        score++;
      }
    });

    const pct = Math.round((score / totalQ) * 100);
    let gradeLetter = 'F';
    let feedbackSummary = '';

    if (pct >= 95) {
      gradeLetter = 'A+ (Distinction)';
      feedbackSummary = 'Teacher Mahmoud Al-Saeed commends your flawless linguistic precision and outstanding mastery across all evaluated competencies!';
    } else if (pct >= 90) {
      gradeLetter = 'A (Excellent)';
      feedbackSummary = 'Teacher Mahmoud Al-Saeed congratulates your exceptional grammar fluency and lexical range. A truly distinguished performance!';
    } else if (pct >= 80) {
      gradeLetter = 'B (Very Good)';
      feedbackSummary = 'Teacher Mahmoud Al-Saeed notes your strong grasp of core structures. Review the few missed rationales to achieve full perfection!';
    } else if (pct >= 70) {
      gradeLetter = 'C (Good)';
      feedbackSummary = 'Teacher Mahmoud Al-Saeed recognizes your solid effort. Continued practice with the interactive flashcards will sharpen your skills further!';
    } else if (pct >= 60) {
      gradeLetter = 'D (Pass)';
      feedbackSummary = 'Teacher Mahmoud Al-Saeed acknowledges your passing mark. Reinforce your foundation using Practice Mode to climb to higher honors!';
    } else {
      feedbackSummary = 'Teacher Mahmoud Al-Saeed encourages you to revisit the corresponding unit modules in Practice Mode and retake the exam to achieve mastery!';
    }

    addXP(score * 10);
    playSound('correct');

    const runner = document.getElementById('exam-runner-container');
    if (!runner) return;

    runner.innerHTML = `
      <div class="exam-runner" style="text-align:center; padding:3rem 2rem;">
        <span class="brand-badge" style="font-size:0.95rem; padding:0.35rem 1.15rem;">Official Result Breakdown</span>
        <h2 style="font-family:'Outfit',sans-serif; font-size:2.2rem; color:var(--accent-slate-dark); margin:0.85rem 0;">
          ${ex.title}
        </h2>
        <p style="color:var(--text-muted); font-size:1.05rem; margin-bottom:1.5rem;">
          Candidate: <strong>${state.studentName}</strong> (${state.studentSchool})
        </p>
        
        <div style="display:inline-flex; align-items:center; gap:2.5rem; background:var(--primary-coral-subtle); border:2px solid var(--primary-coral); padding:1.35rem 3rem; border-radius:var(--radius-lg); margin:1.5rem 0; flex-wrap:wrap; justify-content:center;">
          <div>
            <span style="font-size:0.8rem; text-transform:uppercase; color:var(--text-light); font-weight:800;">Score Achieved</span>
            <div style="font-family:'Outfit',sans-serif; font-size:3rem; font-weight:800; color:var(--primary-coral-deep);">
              ${score} / ${totalQ}
            </div>
          </div>
          <div style="width:1.5px; height:65px; background:var(--border-color);"></div>
          <div>
            <span style="font-size:0.8rem; text-transform:uppercase; color:var(--text-light); font-weight:800;">Percentage</span>
            <div style="font-family:'Outfit',sans-serif; font-size:3rem; font-weight:800; color:var(--accent-slate-dark);">
              ${pct}%
            </div>
          </div>
          <div style="width:1.5px; height:65px; background:var(--border-color);"></div>
          <div>
            <span style="font-size:0.8rem; text-transform:uppercase; color:var(--text-light); font-weight:800;">Academic Grade</span>
            <div style="font-family:'Outfit',sans-serif; font-size:1.9rem; font-weight:800; color:var(--saudi-green);">
              ${gradeLetter}
            </div>
          </div>
          ${state.examBestStreak > 1 ? `
            <div style="width:1.5px; height:65px; background:var(--border-color);"></div>
            <div>
              <span style="font-size:0.8rem; text-transform:uppercase; color:var(--text-light); font-weight:800;">Best Streak</span>
              <div style="font-family:'Outfit',sans-serif; font-size:2.2rem; font-weight:800; color:#ea580c;">
                🔥 ${state.examBestStreak}
              </div>
            </div>
          ` : ''}
        </div>

        <div style="max-width:680px; margin:1rem auto 2rem; background:var(--bg-card); border:1.5px solid var(--border-color); border-radius:var(--radius-md); padding:1.25rem 1.5rem; text-align:left;">
          <strong style="color:var(--accent-slate-dark); font-size:0.95rem; display:block; margin-bottom:0.35rem;">
            👨‍🏫 Teacher Evaluation & Academic Endorsement:
          </strong>
          <p style="color:var(--text-main); font-size:0.92rem; line-height:1.5; margin:0;">
            ${feedbackSummary}
          </p>
        </div>

        <div style="background:#ffffff; border:2.5px solid var(--accent-gold); border-radius:var(--radius-md); padding:2rem; max-width:680px; margin:2.25rem auto; text-align:left; box-shadow:var(--shadow-md);">
          <div style="display:flex; align-items:center; gap:0.85rem; margin-bottom:1.15rem;">
            <span style="font-size:2rem;">📜</span>
            <div>
              <h4 style="font-family:'Outfit',sans-serif; font-size:1.25rem; color:var(--accent-slate-dark);">
                Official Certificate of Academic Distinction
              </h4>
              <p style="font-size:0.88rem; color:var(--text-muted);">
                Officially authorized and certified by <strong>Teacher: Mahmoud Al-Saeed</strong>
              </p>
            </div>
          </div>
          <label style="font-weight:800; font-size:0.92rem; display:block; margin-bottom:0.45rem;">
            Student Name on Official Certificate (in English):
          </label>
          <div style="display:flex; gap:0.6rem;">
            <input type="text" id="certStudentNameInput" value="${state.studentName}" placeholder="e.g. Abdullah Al-Otaibi" style="flex:1; padding:0.8rem 1rem; border:1.5px solid var(--border-color); border-radius:var(--radius-sm); font-size:0.95rem; font-family:inherit;">
            <button class="writing-evaluate-btn" onclick="generateCertificateFromInput('${ex.title}', ${pct}, '${gradeLetter}', '${ex.id}')">
              📜 Generate & Print Certificate
            </button>
          </div>
        </div>

        <div style="display:flex; justify-content:center; gap:1.15rem; margin-top:2rem;">
          <button class="flashcard-nav-btn" onclick="restartSameExam('${ex.id}')">
            🔄 Retake This Exam
          </button>
          <button class="flashcard-nav-btn" style="background:var(--accent-charcoal);" onclick="exitExamFinal()">
            📋 Return to Exams List
          </button>
        </div>
      </div>
    `;
  };

  window.restartSameExam = function(examId) {
    startExam(examId, state.examMode);
  };

  window.exitExamFinal = function() {
    state.activeExam = null;
    renderExamSuite();
  };

  window.generateCertificateFromInput = function(examTitle, pct, gradeLetter, examId) {
    const input = document.getElementById('certStudentNameInput');
    const name = input && input.value.trim() ? input.value.trim() : state.studentName;
    state.studentName = name;
    localStorage.setItem('sg3_student_name', name);
    syncStudentPassport();
    showCertificateModal(name, examTitle, pct, gradeLetter, examId);
  };

  window.restartSameExam = function(examId) {
    startExam(examId, state.examMode);
  };

  window.exitExamFinal = function() {
    state.activeExam = null;
    renderExamSuite();
  };

  // ==========================================================================
  // OFFICIAL CERTIFICATE MODAL & PRINTING
  // ==========================================================================
  function showCertificateModal(studentName, examTitle, scorePct, gradeLetter, examId) {
    const existing = document.getElementById('certificateModalOverlay');
    if (existing) existing.remove();

    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const issueDate = new Date().toLocaleDateString('en-US', dateOptions);
    const serialCode = `SG3-${(examId || 'MASTER').toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'certificateModalOverlay';

    overlay.innerHTML = `
      <div class="certificate-modal-box">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:1.25rem; padding-bottom:1rem; border-bottom:1px solid var(--border-color);">
          <div>
            <strong style="color:var(--accent-slate-dark); font-size:1.15rem; display:block;">Official Academic Certificate Preview</strong>
            <div class="teacher-social-links" style="margin-top:0.4rem;">
              <a href="https://wa.me/966549724510?text=Hello%20Teacher%20Mahmoud%20Al-Saeed%2C%20I%20have%20an%20inquiry%20regarding%20my%20Certificate" target="_blank" rel="noopener noreferrer" class="social-pill whatsapp-pill" title="WhatsApp Chat with Teacher Mahmoud">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.693.078-2.027-.474-1.633-.675-2.678-2.339-2.76-2.449-.081-.11-1.39-1.85-1.39-3.528 0-1.678.878-2.504 1.189-2.846.312-.342.684-.428.913-.428.228 0 .456.002.656.012.211.011.493-.08.77.585.286.687.973 2.378 1.058 2.551.085.173.143.376.029.605-.114.228-.171.371-.342.572-.171.2-.36.446-.514.6-.171.171-.35.357-.151.7.2.342.888 1.464 1.905 2.371 1.309 1.168 2.413 1.53 2.755 1.701.342.171.543.143.743-.086.2-.228.857-.999 1.085-1.342.228-.342.456-.285.77-.171.314.114 1.989.938 2.332 1.109.342.171.571.257.656.4.086.143.086.828-.058 1.233zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.385C8.423 21.494 10.155 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                <span>WhatsApp Inquiry</span>
              </a>
              <a href="https://www.youtube.com/@AwnEdu1" target="_blank" rel="noopener noreferrer" class="social-pill youtube-pill" title="YouTube Channel">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                <span>YouTube</span>
              </a>
              <a href="https://www.linkedin.com/in/mr-mahmoud-elsaed-1a341241b/" target="_blank" rel="noopener noreferrer" class="social-pill linkedin-pill" title="LinkedIn Profile">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.78v8.37H6.46V10.9M7.86 6.32a1.64 1.64 0 0 0-1.64 1.64c0 .91.74 1.64 1.64 1.64.9 0 1.64-.73 1.64-1.64 0-.9-.74-1.64-1.64-1.64z"/></svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
          <div style="display:flex; gap:0.75rem;">
            <button class="writing-evaluate-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
            <button class="theme-toggle-btn" onclick="closeCertModal()">✕ Close</button>
          </div>
        </div>

        <div class="official-certificate">
          <div class="cert-watermark-bg" aria-hidden="true"></div>
          <div class="cert-header">
            <div class="cert-ministry-text">
              <h4>Kingdom of Saudi Arabia • Ministry of Education</h4>
              <p>Intermediate Education • Super Goal 3 Curriculum Suite</p>
            </div>
          </div>

          <div class="cert-title">Certificate of Distinction</div>
          <div class="cert-award-to">This official academic certificate of distinction is proudly conferred upon:</div>
          <div class="cert-student-name">${studentName}</div>

          <div class="cert-body-text">
            in formal recognition of outstanding linguistic competence, superior grammatical command, and lexical mastery across <strong>Super Goal 3 (Units 1–4: Complete Term 1 Curriculum Suite)</strong>, including daily routines, frequency adverbs, personal biographies, historical milestones, habitual actions with 'used to', Simple Past inflections, passive expressions with 'be + born', community service, and visionary leadership under the Custodian of the Two Holy Mosques King Salman bin Abdulaziz.
          </div>

          <div class="cert-meta-grid">
            <div class="cert-meta-item">
              <span class="lbl">Examination Title</span>
              <span class="val">${examTitle.split(':')[1] || examTitle}</span>
            </div>
            <div class="cert-meta-item">
              <span class="lbl">Score Percentage</span>
              <span class="val">${scorePct}%</span>
            </div>
            <div class="cert-meta-item">
              <span class="lbl">Grade Classification</span>
              <span class="val">${gradeLetter}</span>
            </div>
            <div class="cert-meta-item">
              <span class="lbl">Date of Issue</span>
              <span class="val">${issueDate}</span>
            </div>
          </div>

          <div class="cert-footer-row">
            <div class="cert-seal">
              ★ OFFICIAL ★<br>DISTINCTION<br>HONOR SEAL
            </div>
            <div style="text-align:center;">
              <span style="font-size:0.72rem; color:var(--text-light); text-transform:uppercase; font-weight:800;">Certificate Serial Code</span><br>
              <code style="font-size:0.9rem; color:var(--text-muted); font-weight:800;">${serialCode}</code>
            </div>
            <div class="cert-signature-block">
              <div class="cert-signature-name">Teacher Mahmoud Al-Saeed</div>
              <div class="cert-signature-title">Teacher: Mahmoud Al-Saeed</div>
              <div class="cert-signature-title">English Language Instructor & Academic Supervisor</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    playSound('correct');
  }
  window.showCertificateModal = showCertificateModal;

  window.closeCertModal = function() {
    const m = document.getElementById('certificateModalOverlay');
    if (m) m.remove();
  };

  // Initial Initialization
  syncStudentPassport();
  initStarStudentTicker();
  renderOverview();
  applyVocabFilters();
  renderGrammarAcademy();
  renderSkillsAndPronunciation();
  renderReadingLounge();
  renderWritingStudio();
  renderDiscussionArena();
  renderExamSuite();

  console.log('Super Goal 3 Master Interactive Platform initialized successfully.');
});
