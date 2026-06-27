/* ==========================================================================
   拼音島大冒險 - 遊戲核心邏輯 (game.js)
   包含詞庫、音效合成、語音 TTS、Canvas 動態紙花、狀態控制與各練習模式
   ========================================================================== */

// 1. 拼音字母對照資料 (教學用)
const INITIALS_TUTORIAL = [
  { pinyin: "b", zhuyin: "ㄅ", example: "爸 (bà)" },
  { pinyin: "p", zhuyin: "ㄆ", example: "婆 (pó)" },
  { pinyin: "m", zhuyin: "ㄇ", example: "媽 (mā)" },
  { pinyin: "f", zhuyin: "ㄈ", example: "飛 (fēi)" },
  { pinyin: "d", zhuyin: "ㄉ", example: "大 (dà)" },
  { pinyin: "t", zhuyin: "ㄊ", example: "兔 (tù)" },
  { pinyin: "n", zhuyin: "ㄋ", example: "泥 (ní)" },
  { pinyin: "l", zhuyin: "ㄌ", example: "綠 (lǜ)" },
  { pinyin: "g", zhuyin: "ㄍ", example: "歌 (gē)" },
  { pinyin: "k", zhuyin: "ㄎ", example: "可 (kě)" },
  { pinyin: "h", zhuyin: "ㄏ", example: "河 (hé)" },
  { pinyin: "j", zhuyin: "ㄐ", example: "雞 (jī)" },
  { pinyin: "q", zhuyin: "ㄑ", example: "七 (qī)" },
  { pinyin: "x", zhuyin: "ㄒ", example: "西 (xī)" },
  { pinyin: "zh", zhuyin: "ㄓ", example: "豬 (zhū)" },
  { pinyin: "ch", zhuyin: "ㄔ", example: "車 (chē)" },
  { pinyin: "sh", zhuyin: "ㄕ", example: "書 (shū)" },
  { pinyin: "r", zhuyin: "ㄖ", example: "日 (rì)" },
  { pinyin: "z", zhuyin: "ㄗ", example: "字 (zì)" },
  { pinyin: "c", zhuyin: "ㄘ", example: "草 (cǎo)" },
  { pinyin: "s", zhuyin: "ㄙ", example: "四 (sì)" },
  { pinyin: "y", zhuyin: "ㄧ", example: "衣 (yī)" },
  { pinyin: "w", zhuyin: "ㄨ", example: "屋 (wū)" }
];

const FINALS_TUTORIAL = [
  // 單韻母
  { pinyin: "a", zhuyin: "ㄚ", example: "啊 (a)", group: "單韻母" },
  { pinyin: "o", zhuyin: "ㄛ", example: "喔 (o)", group: "單韻母" },
  { pinyin: "e", zhuyin: "ㄜ", example: "鵝 (é)", group: "單韻母" },
  { pinyin: "i", zhuyin: "ㄧ", example: "衣 (yī)", group: "單韻母" },
  { pinyin: "u", zhuyin: "ㄨ", example: "屋 (wū)", group: "單韻母" },
  { pinyin: "ü", zhuyin: "ㄩ", example: "魚 (yú)", group: "單韻母" },
  // 複韻母
  { pinyin: "ai", zhuyin: "ㄞ", example: "愛 (ài)", group: "複韻母" },
  { pinyin: "ei", zhuyin: "ㄟ", example: "飛 (fēi)", group: "複韻母" },
  { pinyin: "ui", zhuyin: "ㄨㄟ", example: "回 (huí)", group: "複韻母" },
  { pinyin: "ao", zhuyin: "ㄠ", example: "貓 (māo)", group: "複韻母" },
  { pinyin: "ou", zhuyin: "ㄡ", example: "狗 (gǒu)", group: "複韻母" },
  { pinyin: "iu", zhuyin: "ㄧㄡ", example: "牛 (niú)", group: "複韻母" },
  { pinyin: "ie", zhuyin: "ㄧㄝ", example: "葉 (yè)", group: "複韻母" },
  { pinyin: "üe", zhuyin: "ㄩㄝ", example: "月 (yuè)", group: "複韻母" },
  { pinyin: "er", zhuyin: "er", example: "二 (èr)", group: "複韻母" },
  // 鼻韻母
  { pinyin: "an", zhuyin: "ㄢ", example: "山 (shān)", group: "鼻韻母" },
  { pinyin: "en", zhuyin: "ㄣ", example: "人 (rén)", group: "鼻韻母" },
  { pinyin: "in", zhuyin: "ㄧㄣ", example: "音 (yīn)", group: "鼻韻母" },
  { pinyin: "un", zhuyin: "ㄨㄣ", example: "問 (wèn)", group: "鼻韻母" },
  { pinyin: "ün", zhuyin: "ㄩㄣ", example: "雲 (yún)", group: "鼻韻母" },
  { pinyin: "ang", zhuyin: "ㄤ", example: "羊 (yáng)", group: "鼻韻母" },
  { pinyin: "eng", zhuyin: "ㄥ", example: "風 (fēng)", group: "鼻韻母" },
  { pinyin: "ing", zhuyin: "ㄧㄥ", example: "星 (xīng)", group: "鼻韻母" },
  { pinyin: "ong", zhuyin: "ㄨㄥ", example: "紅 (hóng)", group: "鼻韻母" }
];

// 拼讀規則卡內容
const RULES_TUTORIAL = [
  {
    title: "ü 碰 j q x 要去點 🐟",
    detail: "當小魚母 `ü` 遇到聲母 `j`, `q`, `x` 時，頭上的兩點要擦掉。但遇到 `n`, `l` 時不能去掉喔！",
    example: "例：j + ü ➔ ju (橘子 🍊) / l + ü ➔ lü (綠色 🟢)"
  },
  {
    title: "單獨成音節加 y 或 w 🏠",
    detail: "單韻母 `i`, `u`, `ü` 自成音節時，前面要加上 `y` 或 `w`。如果是 `ü` 開頭的還要去掉頭上的兩點！",
    example: "例：i ➔ yi (衣服 👕) / u ➔ wu (屋子 🏠) / ü ➔ yu (下雨 🌧️)"
  },
  {
    title: "標調順序歌 🎵",
    detail: "聲調符號要標在母音上，順序是：有 `a` 在給 `a` 戴；沒 `a` 找 `o`, `e`；`i`, `u` 並列標在後面那個。",
    example: "例：guǐ (軌 🚊) 標在 i / liú (流 🌊) 標在 u"
  },
  {
    title: "什麼是三拼音節？ 🍉",
    detail: "有些字除了「聲母」和「韻母」，中間還夾著一個介音（如 i, u, ü）。三個拼起來就叫三拼音節！",
    example: "例：g (聲母) + u (介音) + ā (韻母) ➔ guā (西瓜 🍉)"
  }
];

// 2. 詞庫資料庫
const VOCABULARY = [
  {
    word: "蘋果",
    emoji: "🍎",
    english: "Apple",
    pinyin: "píng guǒ",
    zhuyin: "%ㄆㄧㄥˊ %ㄍㄨㄛˇ",
    chars: [
      { char: "蘋", initial: "p", final: "ing", tone: 2, pinyin: "píng", zhuyin: "ㄆㄧㄥˊ", exampleChar: "平" },
      { char: "果", initial: "g", final: "uo", tone: 3, pinyin: "guǒ", zhuyin: "ㄍㄨㄛˇ", exampleChar: "裹" }
    ]
  },
  {
    word: "香蕉",
    emoji: "🍌",
    english: "Banana",
    pinyin: "xiāng jiāo",
    zhuyin: "%ㄒㄧㄤ %ㄐㄧㄠ",
    chars: [
      { char: "香", initial: "x", final: "iang", tone: 1, pinyin: "xiāng", zhuyin: "ㄒㄧㄤ", exampleChar: "箱" },
      { char: "蕉", initial: "j", final: "iao", tone: 1, pinyin: "jiāo", zhuyin: "ㄐㄧㄠ", exampleChar: "交" }
    ]
  },
  {
    word: "西瓜",
    emoji: "🍉",
    english: "Watermelon",
    pinyin: "xī guā",
    zhuyin: "%ㄒㄧ %ㄍㄨㄚ",
    chars: [
      { char: "西", initial: "x", final: "i", tone: 1, pinyin: "xī", zhuyin: "ㄒㄧ", exampleChar: "吸" },
      { char: "瓜", initial: "g", final: "ua", tone: 1, pinyin: "guā", zhuyin: "ㄍㄨㄚ", exampleChar: "刮" }
    ]
  },
  {
    word: "貓咪",
    emoji: "🐱",
    english: "Cat",
    pinyin: "māo mī",
    zhuyin: "%ㄇㄠ %ㄇㄧ",
    chars: [
      { char: "貓", initial: "m", final: "ao", tone: 1, pinyin: "māo", zhuyin: "ㄇㄠ", exampleChar: "包" },
      { char: "咪", initial: "m", final: "i", tone: 1, pinyin: "mī", zhuyin: "ㄇㄧ", exampleChar: "米" }
    ]
  },
  {
    word: "小狗",
    emoji: "🐶",
    english: "Dog",
    pinyin: "xiǎo gǒu",
    zhuyin: "%ㄒㄧㄠˇ %ㄍㄡˇ",
    chars: [
      { char: "小", initial: "x", final: "iao", tone: 3, pinyin: "xiǎo", zhuyin: "ㄒㄧㄠˇ", exampleChar: "曉" },
      { char: "狗", initial: "g", final: "ou", tone: 3, pinyin: "gǒu", zhuyin: "ㄍㄡˇ", exampleChar: "口" }
    ]
  },
  {
    word: "大象",
    emoji: "🐘",
    english: "Elephant",
    pinyin: "dà xiàng",
    zhuyin: "%ㄉㄚˋ %ㄒㄧㄤˋ",
    chars: [
      { char: "大", initial: "d", final: "a", tone: 4, pinyin: "dà", zhuyin: "ㄉㄚˋ", exampleChar: "打" },
      { char: "象", initial: "x", final: "iang", tone: 4, pinyin: "xiàng", zhuyin: "ㄒㄧㄤˋ", exampleChar: "向" }
    ]
  },
  {
    word: "兔子",
    emoji: "🐰",
    english: "Rabbit",
    pinyin: "tù zi",
    zhuyin: "%ㄊㄨˋ %ㄗ˙",
    chars: [
      { char: "兔", initial: "t", final: "u", tone: 4, pinyin: "tù", zhuyin: "ㄊㄨˋ", exampleChar: "吐" },
      { char: "子", initial: "z", final: "i", tone: 0, pinyin: "zi", zhuyin: "ㄗ˙", exampleChar: "自" }
    ]
  },
  {
    word: "獅子",
    emoji: "🦁",
    english: "Lion",
    pinyin: "shī zi",
    zhuyin: "%ㄕ %ㄗ˙",
    chars: [
      { char: "獅", initial: "sh", final: "i", tone: 1, pinyin: "shī", zhuyin: "ㄕ", exampleChar: "師" },
      { char: "子", initial: "z", final: "i", tone: 0, pinyin: "zi", zhuyin: "ㄗ˙", exampleChar: "自" }
    ]
  },
  {
    word: "太陽",
    emoji: "☀️",
    english: "Sun",
    pinyin: "tài yáng",
    zhuyin: "%ㄊㄞˋ %ㄧㄤˊ",
    chars: [
      { char: "太", initial: "t", final: "a", tone: 4, pinyin: "tài", zhuyin: "ㄊㄞˋ", exampleChar: "泰" },
      { char: "陽", initial: "y", final: "ang", tone: 2, pinyin: "yáng", zhuyin: "ㄧㄤˊ", exampleChar: "洋" }
    ]
  },
  {
    word: "月亮",
    emoji: "🌙",
    english: "Moon",
    pinyin: "yuè liang",
    zhuyin: "%ㄩㄝˋ %ㄌㄧㄤ˙",
    chars: [
      { char: "月", initial: "y", final: "ue", tone: 4, pinyin: "yuè", zhuyin: "ㄩㄝˋ", exampleChar: "樂" },
      { char: "亮", initial: "l", final: "iang", tone: 0, pinyin: "liang", zhuyin: "ㄌㄧㄤ˙", exampleChar: "量" }
    ]
  },
  {
    word: "飛機",
    emoji: "✈️",
    english: "Airplane",
    pinyin: "fēi jī",
    zhuyin: "%ㄈㄟ %ㄐㄧ",
    chars: [
      { char: "飛", initial: "f", final: "ei", tone: 1, pinyin: "fēi", zhuyin: "ㄈㄟ", exampleChar: "非" },
      { char: "機", initial: "j", final: "i", tone: 1, pinyin: "jī", zhuyin: "ㄐㄧ", exampleChar: "雞" }
    ]
  },
  {
    word: "火車",
    emoji: "🚂",
    english: "Train",
    pinyin: "huǒ chē",
    zhuyin: "%跑 %ㄔㄜ",
    chars: [
      { char: "火", initial: "h", final: "uo", tone: 3, pinyin: "huǒ", zhuyin: "ㄏㄨㄛˇ", exampleChar: "伙" },
      { char: "車", initial: "ch", final: "e", tone: 1, pinyin: "chē", zhuyin: "ㄔㄜ", exampleChar: "遮" }
    ]
  }
];

// 拼音標聲調對照表
const TONE_MAP = {
  'a': ['a', 'ā', 'á', 'ǎ', 'à'],
  'o': ['o', 'ō', 'ó', 'ǒ', 'ò'],
  'e': ['e', 'ē', 'é', 'ě', 'è'],
  'i': ['i', 'ī', 'í', 'ǐ', 'ì'],
  'u': ['u', 'ū', 'ú', 'ǔ', 'ù'],
  'ü': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ']
};

// 標調輔助函數
function addToneMark(base, tone) {
  if (tone === 0 || tone === 5) return base; // 輕聲 / 無聲調
  let str = base.replace('v', 'ü');
  let targetChar = '';
  
  if (str.includes('a')) targetChar = 'a';
  else if (str.includes('o')) targetChar = 'o';
  else if (str.includes('e')) targetChar = 'e';
  else if (str.includes('ui')) targetChar = 'i';
  else if (str.includes('iu')) targetChar = 'u';
  else if (str.includes('i')) targetChar = 'i';
  else if (str.includes('u')) targetChar = 'u';
  else if (str.includes('ü')) targetChar = 'ü';
  
  if (targetChar && TONE_MAP[targetChar] && TONE_MAP[targetChar][tone]) {
    return str.replace(targetChar, TONE_MAP[targetChar][tone]);
  }
  return str;
}

// 聲調名與字元對照 (用於聲母韻母拼拼樂顯示)
const TONE_SYMBOLS = {
  1: "ˉ",
  2: "ˊ",
  3: "ˇ",
  4: "ˋ",
  0: "·"
};

// 3. Web Audio API 音效類別
class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playPop() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1600, this.ctx.currentTime + 0.06);
    
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playSuccess() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 琶音
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      
      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.4);
    });
  }

  playFailure() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }
}

// 4. TTS 語音發音類別
class TTSController {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.initVoice();
    if (this.synth && this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.initVoice();
    }
  }

  initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // 優先尋找台灣、香港繁體中文，否則一般中文，最後隨機
    this.voice = voices.find(v => v.lang.includes('zh-TW')) ||
                 voices.find(v => v.lang.includes('zh-HK')) ||
                 voices.find(v => v.lang.includes('zh-CN')) ||
                 voices.find(v => v.lang.includes('zh')) ||
                 voices[0];
  }

  speak(text, rate = 0.8) {
    if (!this.synth) return;
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.lang = this.voice ? this.voice.lang : 'zh-TW';
    utterance.rate = rate;
    this.synth.speak(utterance);
  }
}

// 5. Canvas 五彩紙花特效
class ConfettiManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.active = false;
    
    window.addEventListener('resize', () => this.resizeCanvas());
    this.resizeCanvas();
  }

  resizeCanvas() {
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
  }

  start() {
    this.particles = [];
    this.active = true;
    this.resizeCanvas();
    const colors = ['#00f2fe', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#f97316'];
    for (let i = 0; i < 70; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height - this.canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * this.canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.08 + 0.02,
        tiltAngle: 0,
        speed: Math.random() * 3 + 2
      });
    }
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.draw();
  }

  stop() {
    this.active = false;
    setTimeout(() => {
      if (!this.active && this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }, 2000);
  }

  draw() {
    if (!this.active && this.particles.length === 0) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    let activeParticles = 0;
    this.particles.forEach((p, idx) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += p.speed;
      p.x += Math.sin(p.tiltAngle) * 0.5;
      p.tilt = Math.sin(p.tiltAngle - idx/3) * 15;

      if (p.y < this.canvas.height) {
        activeParticles++;
      } else if (this.active) {
        p.y = -20;
        p.x = Math.random() * this.canvas.width;
      }

      this.ctx.beginPath();
      this.ctx.lineWidth = p.r;
      this.ctx.strokeStyle = p.color;
      this.ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      this.ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      this.ctx.stroke();
    });

    if (activeParticles > 0 || this.active) {
      this.animationId = requestAnimationFrame(() => this.draw());
    }
  }
}

// 6. 遊戲主狀態管理器
const Game = {
  // 模組實例
  sounds: new SoundEffects(),
  tts: new TTSController(),
  confetti: null,

  // 狀態變數
  currentScreen: "start-screen",
  currentMode: null,
  score: 0,
  currentLevel: 0,
  maxLevels: 5,
  vocabList: [],
  currentWord: null,

  // 模式 1: 聲母韻母拼拼樂專用
  constSelectedCharIdx: 0, // 當前拼哪一個漢字
  constActiveSlot: "initial", // 當前選中的拼音格
  constCurrentVals: { initial: "", final: "", tone: "" },

  // 模式 2: 聲調大考驗氣球專用
  balloonTargetCharIdx: 0,
  balloonList: [],

  // 模式 4: 連連看專用
  matcherPairs: [], // 已正確配對的連線
  matcherLeftSelected: null,
  matcherRightSelected: null,
  matcherLeftList: [],
  matcherRightList: [],

  // 規則頁數專用
  currentRuleIdx: 0,

  // 初始化遊戲
  init() {
    this.confetti = new ConfettiManager("confetti-canvas");
    this.bindEvents();
    this.renderTutorialInitials();
    this.renderTutorialFinals();
    this.renderTutorialRules();
  },

  // 註冊 DOM 事件
  bindEvents() {
    // 首頁按鈕
    document.getElementById("btn-to-modes").addEventListener("click", () => {
      this.sounds.playClick();
      this.switchScreen("mode-screen");
    });
    document.getElementById("btn-to-tutorial").addEventListener("click", () => {
      this.sounds.playClick();
      this.switchScreen("tutorial-screen");
    });

    // 返回/首頁控制
    document.getElementById("btn-back-home").addEventListener("click", () => {
      this.sounds.playClick();
      this.exitToHome();
    });
    document.getElementById("btn-mode-back").addEventListener("click", () => {
      this.sounds.playClick();
      this.switchScreen("start-screen");
    });
    document.getElementById("btn-tutorial-back").addEventListener("click", () => {
      this.sounds.playClick();
      this.switchScreen("start-screen");
    });

    // 選擇練習模式
    const modeCards = document.querySelectorAll(".mode-card");
    modeCards.forEach(card => {
      card.addEventListener("click", () => {
        const mode = card.getAttribute("data-mode");
        this.sounds.playClick();
        this.startAdventure(mode);
      });
    });

    // 教學標籤頁切換
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        this.sounds.playClick();
        tabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        const tab = btn.getAttribute("data-tab");
        const panels = document.querySelectorAll(".tab-panel");
        panels.forEach(p => p.classList.remove("active"));
        document.getElementById(`tab-${tab}`).classList.add("active");
      });
    });

    // 聲調小教室四聲連讀
    document.getElementById("btn-tone-all-play").addEventListener("click", () => {
      this.sounds.playClick();
      this.playFourTonesSequence();
    });

    // 規則課堂輪播按鈕
    document.getElementById("btn-rule-prev").addEventListener("click", () => {
      this.sounds.playClick();
      this.currentRuleIdx = (this.currentRuleIdx - 1 + RULES_TUTORIAL.length) % RULES_TUTORIAL.length;
      this.renderTutorialRules();
    });
    document.getElementById("btn-rule-next").addEventListener("click", () => {
      this.sounds.playClick();
      this.currentRuleIdx = (this.currentRuleIdx + 1) % RULES_TUTORIAL.length;
      this.renderTutorialRules();
    });

    // 聲韻拼拼樂 - 拼音格選取
    document.querySelectorAll(".pinyin-slot").forEach(slot => {
      slot.addEventListener("click", () => {
        this.sounds.playClick();
        document.querySelectorAll(".pinyin-slot").forEach(s => s.classList.remove("active-slot"));
        slot.classList.add("active-slot");
        this.constActiveSlot = slot.getAttribute("data-slot");
      });
    });

    // 聲韻拼拼樂 - 重置與發音與送出
    document.getElementById("btn-const-reset").addEventListener("click", () => {
      this.sounds.playClick();
      this.resetConstructorSlots();
    });
    document.getElementById("btn-const-speak").addEventListener("click", () => {
      if (this.currentWord) {
        const charObj = this.currentWord.chars[this.constSelectedCharIdx];
        this.tts.speak(charObj.char);
      }
    });
    document.getElementById("btn-const-submit").addEventListener("click", () => {
      this.checkConstructorAnswer();
    });

    // 聲調氣球大考驗 - 聽音按鈕
    document.getElementById("btn-balloon-speak").addEventListener("click", () => {
      if (this.currentWord) this.tts.speak(this.currentWord.word);
    });

    // 聽音辨字挑戰 - 發音與再播
    document.getElementById("btn-listen-play").addEventListener("click", () => {
      this.playListeningQuestionSound();
    });
    document.getElementById("btn-listen-replay").addEventListener("click", () => {
      this.playListeningQuestionSound();
    });

    // 連連看清除
    document.getElementById("btn-matcher-reset").addEventListener("click", () => {
      this.sounds.playClick();
      this.resetMatcher();
    });

    // 答對彈窗下一步
    document.getElementById("btn-modal-speak").addEventListener("click", () => {
      if (this.currentWord) this.tts.speak(this.currentWord.word);
    });
    document.getElementById("btn-modal-next").addEventListener("click", () => {
      this.sounds.playClick();
      document.getElementById("modal-success").classList.remove("active");
      this.confetti.stop();
      this.nextLevel();
    });

    // 結算返回首頁與重試
    document.getElementById("btn-end-restart").addEventListener("click", () => {
      this.sounds.playClick();
      this.startAdventure(this.currentMode);
    });
    document.getElementById("btn-end-home").addEventListener("click", () => {
      this.sounds.playClick();
      this.exitToHome();
    });

    // 重設連連看 Canvas 大小
    window.addEventListener("resize", () => {
      if (this.currentMode === "matcher") {
        this.resizeMatcherCanvas();
        this.drawMatcherLines();
      }
    });
  },

  // 畫面切換控制
  switchScreen(screenId) {
    const screens = document.querySelectorAll(".screen");
    screens.forEach(s => s.classList.remove("active"));
    
    const target = document.getElementById(screenId);
    target.classList.add("active");
    this.currentScreen = screenId;

    // 通用頂部 header 顯示邏輯
    const header = document.getElementById("global-header");
    const progress = document.getElementById("game-progress-container");
    if (screenId === "play-screen") {
      header.classList.remove("hidden");
      progress.classList.remove("hidden");
    } else if (screenId === "tutorial-screen" || screenId === "mode-screen") {
      header.classList.remove("hidden");
      progress.classList.add("hidden");
    } else {
      header.classList.add("hidden");
    }
  },

  // 退出到首頁
  exitToHome() {
    this.currentMode = null;
    this.confetti.stop();
    // 停止氣球動畫迴圈與連連看重置
    this.balloonList = [];
    document.getElementById("modal-success").classList.remove("active");
    this.switchScreen("start-screen");
  },

  // 4 聲連續發音示範 (教學)
  playFourTonesSequence() {
    const toneChars = ["媽", "麻", "馬", "罵", "嗎"];
    let idx = 0;
    const playNext = () => {
      if (idx < toneChars.length) {
        // 點亮當前聲調卡片
        const cards = document.querySelectorAll(".tone-card-interactive");
        cards.forEach(c => c.style.borderColor = "var(--panel-border)");
        
        let toneVal = idx === 4 ? 0 : idx + 1;
        const activeCard = Array.from(cards).find(c => c.getAttribute("data-tone") == toneVal);
        if (activeCard) {
          activeCard.style.borderColor = "var(--color-yellow)";
        }
        
        this.tts.speak(toneChars[idx], 0.7);
        idx++;
        setTimeout(playNext, 1100);
      } else {
        // 恢復正常
        document.querySelectorAll(".tone-card-interactive").forEach(c => c.style.borderColor = "var(--panel-border)");
      }
    };
    playNext();
  },

  // 渲染聲母學習清單
  renderTutorialInitials() {
    const container = document.getElementById("initials-list");
    container.innerHTML = "";
    INITIALS_TUTORIAL.forEach(item => {
      const card = document.createElement("div");
      card.className = "letter-card";
      card.innerHTML = `
        <span class="symbol-main">${item.pinyin}</span>
        <span class="symbol-sub">${item.zhuyin}</span>
        <span class="symbol-example">${item.example}</span>
      `;
      card.addEventListener("click", () => {
        this.sounds.playPop();
        // 唸出範例字
        this.tts.speak(item.example.split(" ")[0]);
      });
      container.appendChild(card);
    });
  },

  // 渲染韻母學習清單
  renderTutorialFinals() {
    const container = document.getElementById("finals-list");
    container.innerHTML = "";
    FINALS_TUTORIAL.forEach(item => {
      const card = document.createElement("div");
      card.className = "letter-card";
      card.innerHTML = `
        <span class="symbol-main">${item.pinyin}</span>
        <span class="symbol-sub">${item.zhuyin}</span>
        <span class="symbol-example">${item.example}</span>
      `;
      card.addEventListener("click", () => {
        this.sounds.playPop();
        this.tts.speak(item.example.split(" ")[0]);
      });
      container.appendChild(card);
    });

    // 聲調卡片單點發音
    document.querySelectorAll(".tone-card-interactive").forEach(card => {
      card.addEventListener("click", () => {
        this.sounds.playClick();
        const tone = card.getAttribute("data-tone");
        const toneChars = {
          1: "媽",
          2: "麻",
          3: "馬",
          4: "罵",
          0: "嗎"
        };
        this.tts.speak(toneChars[tone], 0.7);
      });
    });
  },

  // 渲染拼讀規則卡
  renderTutorialRules() {
    const rule = RULES_TUTORIAL[this.currentRuleIdx];
    document.getElementById("rule-index").innerText = `規則 ${this.currentRuleIdx + 1}/${RULES_TUTORIAL.length}`;
    document.getElementById("rule-title").innerText = rule.title;
    document.getElementById("rule-detail").innerHTML = rule.detail.replace(/`([^`]+)`/g, '<span class="highlight" style="font-size:1.05rem">$1</span>');
    document.getElementById("rule-example").innerText = rule.example;
  },

  // ==========================================================================
  // 遊戲核心邏輯：開始冒險
  // ==========================================================================
  startAdventure(mode) {
    this.currentMode = mode;
    this.score = 0;
    this.currentLevel = 0;
    
    // 更新頂部顯示的星星
    document.getElementById("score-val").innerText = this.score;

    // 從庫中隨機選出 5 個詞進行闖關
    this.vocabList = [...VOCABULARY].sort(() => Math.random() - 0.5).slice(0, this.maxLevels);

    // 切換顯示模式區域
    document.querySelectorAll(".workspace-panel").forEach(p => p.classList.remove("active"));
    document.getElementById(`workspace-${mode}`).classList.add("active");

    this.switchScreen("play-screen");
    this.loadLevel();
  },

  // 載入關卡
  loadLevel() {
    if (this.currentLevel >= this.maxLevels) {
      this.showEndScreen();
      return;
    }

    // 更新進度條
    const progressPercent = (this.currentLevel / this.maxLevels) * 100;
    document.getElementById("progress-bar-inner").style.width = `${progressPercent}%`;
    document.getElementById("progress-text").innerText = `${this.currentLevel + 1}/${this.maxLevels}`;

    this.currentWord = this.vocabList[this.currentLevel];
    
    // 依模式載入工作區
    if (this.currentMode === "constructor") {
      this.initConstructorMode();
    } else if (this.currentMode === "balloons") {
      this.initBalloonsMode();
    } else if (this.currentMode === "listening") {
      this.initListeningMode();
    } else if (this.currentMode === "matcher") {
      this.initMatcherMode();
    }
  },

  // 關卡答對處理
  levelComplete() {
    this.score += 10;
    document.getElementById("score-val").innerText = this.score;
    
    this.sounds.playSuccess();
    this.confetti.start();

    // 彈出詞彙說明視窗
    this.showSuccessModal();
  },

  // 下一關
  nextLevel() {
    this.currentLevel++;
    this.loadLevel();
  },

  // 展示答對詳細知識彈窗
  showSuccessModal() {
    const modal = document.getElementById("modal-success");
    document.getElementById("modal-vocab-emoji").innerText = this.currentWord.emoji;
    document.getElementById("modal-vocab-word").innerText = this.currentWord.word;
    document.getElementById("modal-vocab-pinyin").innerText = this.currentWord.pinyin;
    document.getElementById("modal-vocab-zhuyin").innerText = this.currentWord.zhuyin.replace(/%/g, "");
    document.getElementById("modal-vocab-english").innerText = this.currentWord.english;

    // 漢字聲韻拆解卡
    const cardsContainer = document.getElementById("modal-vocab-breakdown-cards");
    cardsContainer.innerHTML = "";
    this.currentWord.chars.forEach(c => {
      const card = document.createElement("div");
      card.className = "breakdown-card";
      
      const toneMark = TONE_SYMBOLS[c.tone] || "無";
      card.innerHTML = `
        <span class="bd-char">${c.char}</span>
        <span class="bd-pinyin">${c.pinyin}</span>
        <div class="bd-parts">
          <span>聲母: <strong>${c.initial || "無"}</strong></span>
          <span>韻母: <strong>${c.final}</strong></span>
          <span>聲調: <strong>${c.tone} 聲 (${toneMark})</strong></span>
          <span style="color:var(--color-yellow); margin-top:4px">${c.zhuyin}</span>
        </div>
      `;
      cardsContainer.appendChild(card);
    });

    modal.classList.add("active");
    // TTS 發音
    setTimeout(() => {
      this.tts.speak(this.currentWord.word);
    }, 300);
  },

  // 結算畫面
  showEndScreen() {
    this.sounds.playSuccess();
    this.confetti.start();
    this.switchScreen("end-screen");
    
    document.getElementById("end-score-val").innerText = this.score;
    
    // 依分數給予星星數量評價
    let starsStr = "⭐⭐⭐⭐⭐";
    if (this.score >= 50) starsStr = "⭐⭐⭐⭐⭐";
    else if (this.score >= 40) starsStr = "⭐⭐⭐⭐☆";
    else if (this.score >= 30) starsStr = "⭐⭐⭐☆☆";
    else starsStr = "⭐⭐☆☆☆";
    
    document.getElementById("end-stars").innerText = starsStr;

    // 發音讚美
    setTimeout(() => {
      this.tts.speak("太棒了，恭喜通關！");
    }, 400);
  },

  // ==========================================================================
  // [模式 1] 聲韻拼拼樂 (Constructor) 邏輯
  // ==========================================================================
  initConstructorMode() {
    // 每次載入時，隨機選中該詞彙的其中一個漢字讓玩家拼寫
    this.constSelectedCharIdx = Math.floor(Math.random() * this.currentWord.chars.length);
    const charObj = this.currentWord.chars[this.constSelectedCharIdx];

    // 更新漢字顯示
    document.getElementById("const-emoji").innerText = this.currentWord.emoji;
    document.getElementById("const-word").innerText = this.currentWord.word;
    document.getElementById("const-trans").innerText = this.currentWord.english;
    document.getElementById("const-target-char").innerText = charObj.char;

    // 清除 slots
    this.resetConstructorSlots();

    // 渲染候選卡片池
    this.renderConstructorPools(charObj);
  },

  resetConstructorSlots() {
    this.constCurrentVals = { initial: "", final: "", tone: "" };
    document.getElementById("slot-initial").innerText = "?";
    document.getElementById("slot-final").innerText = "?";
    document.getElementById("slot-tone").innerText = "?";
    
    document.querySelectorAll(".pinyin-slot").forEach(s => s.classList.remove("filled"));
    document.getElementById("const-pinyin-output").innerText = "_ _ _";
    
    // 取消候選卡池置灰
    document.querySelectorAll(".pool-card").forEach(c => c.classList.remove("selected"));

    // 預設選中聲母格
    document.querySelectorAll(".pinyin-slot").forEach(s => s.classList.remove("active-slot"));
    const initSlot = document.querySelector('[data-slot="initial"]');
    initSlot.classList.add("active-slot");
    this.constActiveSlot = "initial";
  },

  renderConstructorPools(charObj) {
    const initialsPool = document.getElementById("pool-initials");
    const finalsPool = document.getElementById("pool-finals");
    const tonesPool = document.getElementById("pool-tones");

    initialsPool.innerHTML = "";
    finalsPool.innerHTML = "";
    tonesPool.innerHTML = "";

    // 1. 聲母池：包含正確聲母 + 5 個隨機干擾
    const correctInit = charObj.initial;
    let initsList = [correctInit];
    while (initsList.length < 6) {
      const randInit = INITIALS_TUTORIAL[Math.floor(Math.random() * INITIALS_TUTORIAL.length)].pinyin;
      if (!initsList.includes(randInit)) initsList.push(randInit);
    }
    initsList.sort(() => Math.random() - 0.5);

    initsList.forEach(item => {
      const card = document.createElement("div");
      card.className = "pool-card";
      card.innerText = item === "" ? "無" : item;
      card.addEventListener("click", () => this.handleConstructorCardClick("initial", item, card));
      initialsPool.appendChild(card);
    });

    // 2. 韻母池：包含正確韻母 + 5 個隨機干擾
    const correctFinal = charObj.final;
    let finalsList = [correctFinal];
    while (finalsList.length < 6) {
      const randFinal = FINALS_TUTORIAL[Math.floor(Math.random() * FINALS_TUTORIAL.length)].pinyin;
      if (!finalsList.includes(randFinal)) finalsList.push(randFinal);
    }
    finalsList.sort(() => Math.random() - 0.5);

    finalsList.forEach(item => {
      const card = document.createElement("div");
      card.className = "pool-card";
      card.innerText = item;
      card.addEventListener("click", () => this.handleConstructorCardClick("final", item, card));
      finalsPool.appendChild(card);
    });

    // 3. 聲調池：1-4聲與輕聲
    const tonesList = [1, 2, 3, 4, 0];
    tonesList.forEach(item => {
      const card = document.createElement("div");
      card.className = "pool-card";
      card.innerText = TONE_SYMBOLS[item];
      card.addEventListener("click", () => this.handleConstructorCardClick("tone", item, card));
      tonesPool.appendChild(card);
    });
  },

  handleConstructorCardClick(type, value, cardEl) {
    if (this.constActiveSlot !== type) {
      // 提醒用戶點選正確的欄位
      this.sounds.playClick();
      // 切換選中欄位
      document.querySelectorAll(".pinyin-slot").forEach(s => s.classList.remove("active-slot"));
      const slot = document.querySelector(`[data-slot="${type}"]`);
      slot.classList.add("active-slot");
      this.constActiveSlot = type;
    }

    this.sounds.playPop();

    // 恢復該組之前置灰的卡片
    cardEl.parentElement.querySelectorAll(".pool-card").forEach(c => c.classList.remove("selected"));
    cardEl.classList.add("selected");

    this.constCurrentVals[type] = value;
    
    // 更新插槽畫面
    const slotValEl = document.getElementById(`slot-${type}`);
    slotValEl.innerText = type === "tone" ? TONE_SYMBOLS[value] : (value === "" ? "無" : value);
    document.querySelector(`[data-slot="${type}"]`).classList.add("filled");

    // 組合結果動態顯示
    this.updateCombinedConstructorPinyin();

    // 自動跳轉下一個空白格
    if (type === "initial") {
      this.autoSelectSlot("final");
    } else if (type === "final") {
      this.autoSelectSlot("tone");
    }
  },

  autoSelectSlot(targetSlot) {
    document.querySelectorAll(".pinyin-slot").forEach(s => s.classList.remove("active-slot"));
    const slot = document.querySelector(`[data-slot="${targetSlot}"]`);
    slot.classList.add("active-slot");
    this.constActiveSlot = targetSlot;
  },

  updateCombinedConstructorPinyin() {
    const vals = this.constCurrentVals;
    if (vals.final !== "") {
      const combined = addToneMark(vals.initial + vals.final, vals.tone === "" ? 5 : vals.tone);
      document.getElementById("const-pinyin-output").innerText = combined;
    } else {
      document.getElementById("const-pinyin-output").innerText = (vals.initial || "_") + " + _ + _";
    }
  },

  checkConstructorAnswer() {
    const vals = this.constCurrentVals;
    const charObj = this.currentWord.chars[this.constSelectedCharIdx];

    // 如果沒有填滿，震動提示
    if (vals.final === "" || vals.tone === "") {
      this.sounds.playFailure();
      const workspace = document.getElementById("workspace-constructor");
      workspace.classList.add("shake");
      setTimeout(() => workspace.classList.remove("shake"), 400);
      return;
    }

    const playerAnswer = addToneMark(vals.initial + vals.final, vals.tone);
    const correctAnswer = charObj.pinyin;

    if (playerAnswer === correctAnswer) {
      this.levelComplete();
    } else {
      // 答錯
      this.sounds.playFailure();
      const workspace = document.getElementById("workspace-constructor");
      workspace.classList.add("shake");
      setTimeout(() => workspace.classList.remove("shake"), 400);
      // 閃爍紅色 slots
      document.querySelectorAll(".pinyin-slot").forEach(s => {
        s.style.borderColor = "hsl(0, 85%, 60%)";
        setTimeout(() => s.style.borderColor = "", 1000);
      });
    }
  },

  // ==========================================================================
  // [模式 2] 聲調大考驗 (Balloons) 邏輯
  // ==========================================================================
  initBalloonsMode() {
    // 隨機選一個漢字來測聲調
    this.balloonTargetCharIdx = Math.floor(Math.random() * this.currentWord.chars.length);
    const charObj = this.currentWord.chars[this.balloonTargetCharIdx];

    // 卡片內容
    document.getElementById("balloon-emoji").innerText = this.currentWord.emoji;
    document.getElementById("balloon-word").innerText = this.currentWord.word;
    document.getElementById("balloon-trans").innerText = this.currentWord.english;

    // 將考題拼音隱藏聲調標誌
    let textBlank = "";
    this.currentWord.chars.forEach((c, idx) => {
      if (idx === this.balloonTargetCharIdx) {
        // 這是要考的字
        const pinyinWithoutTone = c.initial + c.final;
        textBlank += `<span class="highlight">${pinyinWithoutTone}[?]</span>`;
      } else {
        textBlank += ` ${c.pinyin} `;
      }
    });
    document.getElementById("balloon-pinyin-blank").innerHTML = textBlank;

    // 清除氣球並生成
    this.balloonList = [];
    const stage = document.getElementById("balloons-stage");
    stage.innerHTML = "";

    // 建立 5 個不同聲調氣球
    const tones = [1, 2, 3, 4, 0];
    const colors = [1, 2, 3, 4, 0];
    
    // 亂序生成
    tones.sort(() => Math.random() - 0.5);

    const rect = stage.getBoundingClientRect();
    const stageWidth = rect.width || 340;
    const stageHeight = rect.height || 280;

    tones.forEach((tone, idx) => {
      const balloonEl = document.createElement("div");
      balloonEl.className = `balloon balloon-color-${colors[tone]}`;
      balloonEl.innerHTML = `<span>${TONE_SYMBOLS[tone]}</span><div class="balloon-string"></div>`;
      
      stage.appendChild(balloonEl);

      // 動態浮動定位與速度
      const balloonObj = {
        el: balloonEl,
        tone: tone,
        x: Math.random() * (stageWidth - 80),
        y: stageHeight + Math.random() * 150, // 錯開出現時間
        speed: Math.random() * 0.8 + 0.5,
        width: 70
      };

      balloonEl.style.left = `${balloonObj.x}px`;
      balloonEl.style.bottom = `${-100}px`;

      // 綁定點擊事件
      balloonEl.addEventListener("click", () => {
        this.handleBalloonClick(balloonObj);
      });

      this.balloonList.push(balloonObj);
    });

    // 啟動氣球動畫輪詢
    if (this.balloonList.length > 0) {
      // 防止多次調用 requestAnimationFrame
      if (this.balloonAnimationId) cancelAnimationFrame(this.balloonAnimationId);
      this.animateBalloons();
    }
  },

  animateBalloons() {
    if (this.currentMode !== "balloons" || this.currentScreen !== "play-screen") return;
    
    const stage = document.getElementById("balloons-stage");
    const rect = stage.getBoundingClientRect();
    const stageWidth = rect.width || 340;
    const stageHeight = rect.height || 280;

    this.balloonList.forEach(b => {
      b.y -= b.speed;
      
      // 當氣球飛出頂部，重新循環至底部
      if (b.y < -90) {
        b.y = stageHeight + 20;
        b.x = Math.random() * (stageWidth - 85);
      }
      
      b.el.style.transform = `translateY(${- (stageHeight - b.y)}px)`;
      b.el.style.left = `${b.x}px`;
    });

    this.balloonAnimationId = requestAnimationFrame(() => this.animateBalloons());
  },

  handleBalloonClick(balloonObj) {
    const charObj = this.currentWord.chars[this.balloonTargetCharIdx];
    const correctTone = charObj.tone;

    if (balloonObj.tone === correctTone) {
      // 答對了！
      this.sounds.playPop();
      
      // 氣球爆炸特效 (縮放並消失)
      balloonObj.el.style.transform += " scale(1.4)";
      balloonObj.el.style.opacity = "0";
      balloonObj.el.style.pointerEvents = "none";
      
      // 停止動畫
      this.balloonList = [];
      
      setTimeout(() => {
        this.levelComplete();
      }, 400);
    } else {
      // 答錯，氣球反彈震動
      this.sounds.playFailure();
      balloonObj.el.classList.add("shake");
      setTimeout(() => balloonObj.el.classList.remove("shake"), 400);
      
      // 扣除少許星星
      if (this.score > 0) {
        this.score = Math.max(0, this.score - 2);
        document.getElementById("score-val").innerText = this.score;
      }
    }
  },

  // ==========================================================================
  // [模式 3] 聽音辨字挑戰 (Listening) 邏輯
  // ==========================================================================
  initListeningMode() {
    const optionsGrid = document.getElementById("listening-options");
    optionsGrid.innerHTML = "";

    // 產生聽音選項 (1 正確 + 3 干擾)
    const options = this.generateListeningOptions(this.currentWord);

    options.forEach(opt => {
      const card = document.createElement("div");
      card.className = "option-card";
      
      // 我們只顯示拼音與對應的代表字，不顯示注音以強調聽音拼音對照，或是簡單顯示
      card.innerHTML = `
        <span class="opt-pinyin">${opt.pinyin}</span>
        <span class="opt-zhuyin">${opt.zhuyin}</span>
      `;

      card.addEventListener("click", () => {
        this.handleListeningAnswer(opt, card);
      });
      optionsGrid.appendChild(card);
    });

    // 自動播放發音
    setTimeout(() => {
      this.playListeningQuestionSound();
    }, 400);
  },

  playListeningQuestionSound() {
    if (this.currentWord) {
      // 喇叭動畫
      const ring = document.querySelector(".pulse-ring");
      if (ring) {
        ring.style.animation = "none";
        setTimeout(() => ring.style.animation = "ringPulse 1.2s infinite ease-out", 10);
        setTimeout(() => ring.style.animation = "none", 2400);
      }
      this.tts.speak(this.currentWord.word);
    }
  },

  handleListeningAnswer(opt, cardEl) {
    if (opt.correct) {
      this.levelComplete();
    } else {
      this.sounds.playFailure();
      cardEl.classList.add("shake");
      setTimeout(() => cardEl.classList.remove("shake"), 400);
      cardEl.style.borderColor = "hsl(0, 85%, 60%)";
      cardEl.style.opacity = "0.6";
      cardEl.style.pointerEvents = "none";
      
      if (this.score > 0) {
        this.score = Math.max(0, this.score - 2);
        document.getElementById("score-val").innerText = this.score;
      }
    }
  },

  generateListeningOptions(wordObj) {
    const correctPinyin = wordObj.pinyin;
    const correctZhuyin = wordObj.zhuyin.replace(/%/g, "");
    const options = [{
      pinyin: correctPinyin,
      zhuyin: correctZhuyin,
      correct: true
    }];

    const tones = [1, 2, 3, 4, 0];
    const zhuyinTones = ["", "ˊ", "ˇ", "ˋ", "˙"];
    const usedPinyins = new Set([correctPinyin]);

    while (options.length < 4) {
      let wrongPinyins = [];
      let wrongZhuyins = [];

      // 決定修改類型：單純修改聲調，或修改字母
      const alterType = Math.random() < 0.6 ? 'tone' : 'letter';

      wordObj.chars.forEach(c => {
        if (alterType === 'tone') {
          // 修改聲調
          let newTone = c.tone;
          while (newTone === c.tone) {
            newTone = tones[Math.floor(Math.random() * tones.length)];
          }
          wrongPinyins.push(addToneMark(c.initial + c.final, newTone));
          
          let baseZhuyin = c.zhuyin.replace(/[ˊˇˋ˙]/g, "");
          if (newTone === 0) {
            wrongZhuyins.push("˙" + baseZhuyin);
          } else {
            wrongZhuyins.push(baseZhuyin + zhuyinTones[newTone]);
          }
        } else {
          // 修改字母 (替換發音相近的聲母/韻母)
          const initialMap = {
            'b': 'p', 'p': 'b', 'd': 't', 't': 'd', 'g': 'k', 'k': 'g', 
            'l': 'n', 'n': 'l', 'j': 'q', 'q': 'j', 'zh': 'ch', 'ch': 'zh',
            'z': 'c', 'c': 'z', 's': 'sh', 'sh': 's', 'x': 's'
          };
          let newInit = c.initial;
          if (initialMap[c.initial] && Math.random() < 0.6) {
            newInit = initialMap[c.initial];
          }

          const finalMap = {
            'an': 'ang', 'ang': 'an', 'en': 'eng', 'eng': 'en',
            'in': 'ing', 'ing': 'in', 'o': 'e', 'e': 'o', 'ai': 'ei',
            'ei': 'ai', 'ao': 'ou', 'ou': 'ao', 'uo': 'u'
          };
          let newFinal = c.final;
          if (finalMap[c.final] && Math.random() < 0.6) {
            newFinal = finalMap[c.final];
          }

          // 強制製造不同
          let newTone = c.tone;
          if (newInit === c.initial && newFinal === c.final) {
            newTone = (c.tone + 1) % 5;
          }

          wrongPinyins.push(addToneMark(newInit + newFinal, newTone));
          wrongZhuyins.push(""); // 連同注音替換太複雜，此時干擾選項可略過注音顯示
        }
      });

      const pinyinStr = wrongPinyins.join(" ");
      if (!usedPinyins.has(pinyinStr)) {
        usedPinyins.add(pinyinStr);
        options.push({
          pinyin: pinyinStr,
          zhuyin: wrongZhuyins.join(" ").trim(),
          correct: false
        });
      }
    }

    return options.sort(() => Math.random() - 0.5);
  },

  // ==========================================================================
  // [模式 4] 注音拼音連連看 (Matcher) 邏輯
  // ==========================================================================
  initMatcherMode() {
    this.matcherPairs = [];
    this.matcherLeftSelected = null;
    this.matcherRightSelected = null;

    // 取出本關卡的 4 個字或詞（如果當前詞是雙字詞，我們從關卡列表拼湊 4 個字）
    this.matcherLeftList = [];
    this.matcherRightList = [];

    // 取出當前與前後共4個單字做連連看
    let idxList = [];
    for (let i = 0; i < 4; i++) {
      let vIdx = (this.currentLevel + i) % this.vocabList.length;
      let vocab = this.vocabList[vIdx];
      let charObj = vocab.chars[0]; // 拿每個詞的第一個字來比
      idxList.push({
        id: `m-${i}`,
        char: charObj.char,
        zhuyin: charObj.zhuyin,
        pinyin: charObj.pinyin
      });
    }

    // 複製並洗牌
    const leftData = [...idxList].sort(() => Math.random() - 0.5);
    const rightData = [...idxList].sort(() => Math.random() - 0.5);

    this.matcherLeftList = leftData;
    this.matcherRightList = rightData;

    this.renderMatcherColumns();
    this.resizeMatcherCanvas();
    this.drawMatcherLines();
  },

  renderMatcherColumns() {
    const leftCol = document.getElementById("matcher-left");
    const rightCol = document.getElementById("matcher-right");
    leftCol.innerHTML = "";
    rightCol.innerHTML = "";

    // 左側：注音
    this.matcherLeftList.forEach(item => {
      const card = document.createElement("div");
      card.className = "match-item";
      card.setAttribute("data-id", item.id);
      card.setAttribute("data-side", "left");
      card.innerHTML = `
        <span style="font-size:0.85rem; color:var(--text-muted)">${item.char}</span><br>
        <span style="color:var(--color-yellow)">${item.zhuyin}</span>
        <div class="match-dot"></div>
      `;
      card.addEventListener("click", () => this.handleMatcherItemClick(item.id, "left", card));
      leftCol.appendChild(card);
    });

    // 右側：拼音
    this.matcherRightList.forEach(item => {
      const card = document.createElement("div");
      card.className = "match-item";
      card.setAttribute("data-id", item.id);
      card.setAttribute("data-side", "right");
      card.innerHTML = `
        <span style="font-size:0.85rem; color:var(--text-muted)">${item.char}</span><br>
        <span style="color:var(--color-cyan)">${item.pinyin}</span>
        <div class="match-dot"></div>
      `;
      card.addEventListener("click", () => this.handleMatcherItemClick(item.id, "right", card));
      rightCol.appendChild(card);
    });
  },

  handleMatcherItemClick(id, side, cardEl) {
    this.sounds.playClick();

    if (side === "left") {
      // 點選左側
      if (this.matcherLeftSelected === id) {
        // 取消選取
        this.matcherLeftSelected = null;
        cardEl.classList.remove("selected");
      } else {
        // 清除左側舊選取
        document.querySelectorAll('#matcher-left .match-item').forEach(el => el.classList.remove("selected"));
        this.matcherLeftSelected = id;
        cardEl.classList.add("selected");
      }
    } else {
      // 點選右側
      if (this.matcherRightSelected === id) {
        this.matcherRightSelected = null;
        cardEl.classList.remove("selected");
      } else {
        document.querySelectorAll('#matcher-right .match-item').forEach(el => el.classList.remove("selected"));
        this.matcherRightSelected = id;
        cardEl.classList.add("selected");
      }
    }

    // 如果兩邊都選了，檢查是否匹配
    if (this.matcherLeftSelected && this.matcherRightSelected) {
      if (this.matcherLeftSelected === this.matcherRightSelected) {
        // 配對成功！
        const pairId = this.matcherLeftSelected;
        this.matcherPairs.push(pairId);
        this.sounds.playPop();

        // 將對應卡片改為 matched
        const leftEl = document.querySelector(`#matcher-left [data-id="${pairId}"]`);
        const rightEl = document.querySelector(`#matcher-right [data-id="${pairId}"]`);
        
        leftEl.classList.remove("selected");
        leftEl.classList.add("matched");
        rightEl.classList.remove("selected");
        rightEl.classList.add("matched");

        this.matcherLeftSelected = null;
        this.matcherRightSelected = null;

        // 重新繪圖
        this.drawMatcherLines();

        // 檢查是否全部連完
        if (this.matcherPairs.length === 4) {
          setTimeout(() => {
            this.levelComplete();
          }, 600);
        }
      } else {
        // 配對失敗
        this.sounds.playFailure();
        const leftEl = document.querySelector(`#matcher-left [data-id="${this.matcherLeftSelected}"]`);
        const rightEl = document.querySelector(`#matcher-right [data-id="${this.matcherRightSelected}"]`);
        
        leftEl.classList.add("shake");
        rightEl.classList.add("shake");
        
        setTimeout(() => {
          leftEl.classList.remove("shake", "selected");
          rightEl.classList.remove("shake", "selected");
        }, 400);

        this.matcherLeftSelected = null;
        this.matcherRightSelected = null;
      }
    }
  },

  resetMatcher() {
    this.matcherPairs = [];
    this.matcherLeftSelected = null;
    this.matcherRightSelected = null;
    
    document.querySelectorAll('.match-item').forEach(el => {
      el.classList.remove("selected", "matched");
    });
    
    this.drawMatcherLines();
  },

  resizeMatcherCanvas() {
    const canvas = document.getElementById("matcher-canvas");
    const container = document.getElementById("matcher-container");
    if (canvas && container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
  },

  drawMatcherLines() {
    const canvas = document.getElementById("matcher-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const containerRect = document.getElementById("matcher-container").getBoundingClientRect();

    this.matcherPairs.forEach(pairId => {
      const leftEl = document.querySelector(`#matcher-left [data-id="${pairId}"]`);
      const rightEl = document.querySelector(`#matcher-right [data-id="${pairId}"]`);
      
      if (leftEl && rightEl) {
        const leftDot = leftEl.querySelector(".match-dot");
        const rightDot = rightEl.querySelector(".match-dot");
        
        const r1 = leftDot.getBoundingClientRect();
        const r2 = rightDot.getBoundingClientRect();
        
        const x1 = r1.left + r1.width / 2 - containerRect.left;
        const y1 = r1.top + r1.height / 2 - containerRect.top;
        const x2 = r2.left + r2.width / 2 - containerRect.left;
        const y2 = r2.top + r2.height / 2 - containerRect.top;

        // 畫霓虹綠連線
        ctx.shadowBlur = 10;
        ctx.shadowColor = "hsl(145, 75%, 50%)";
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "var(--color-green)";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();
        
        ctx.shadowBlur = 0; // 恢復
      }
    });
  }
};

// 網頁載入後啟動
window.addEventListener("DOMContentLoaded", () => {
  Game.init();
});
