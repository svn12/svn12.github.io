// 漫畫數據結構 (自動生成後會被完整的內容覆寫)
const mangaData = {
    title: "深夜裸醒謎案",
    pages: [
        {
            chapter: "起",
            image: "images/page1.png",
            dialogues: [
                {
                    character: "旁白",
                    text: "深夜兩點，艾莉絲從一場怪夢中醒來...",
                    audio: "audio/page1_dialogue1.mp3"
                },
                {
                    character: "艾莉絲",
                    text: "唔... 怎麼今天晚上冷氣吹起來特別涼？",
                    audio: "audio/page1_dialogue2.mp3"
                },
                {
                    character: "旁白",
                    text: "下一秒，她發現了驚人的事實——",
                    audio: "audio/page1_dialogue3.mp3"
                },
                {
                    character: "艾莉絲",
                    text: "等等！我的睡衣呢？！為什麼我一件衣服都沒穿？！",
                    audio: "audio/page1_dialogue4.mp3"
                }
            ]
        },
        {
            chapter: "承",
            image: "images/page2.png",
            dialogues: [
                {
                    character: "艾莉絲",
                    text: "冷氣吹得好冷... 衣服總不可能自己飛走吧？",
                    audio: "audio/page2_dialogue1.mp3"
                },
                {
                    character: "旁白",
                    text: "然而衣櫃裡只剩冬天的厚重外套。",
                    audio: "audio/page2_dialogue2.mp3"
                },
                {
                    character: "艾莉絲",
                    text: "呀！窗外有聲音？！該不會是小偷...",
                    audio: "audio/page2_dialogue3.mp3"
                },
                {
                    character: "旁白",
                    text: "謎團越來越深了，睡衣居然掛在樹上飄浮著。",
                    audio: "audio/page2_dialogue4.mp3"
                }
            ]
        },
        {
            chapter: "合",
            image: "images/page3.png",
            dialogues: [
                {
                    character: "艾莉絲",
                    text: "到底是怎麼掛上去的啦... 這高度我也拿不到啊。",
                    audio: "audio/page3_dialogue1.mp3"
                },
                {
                    character: "橘貓",
                    text: "喵嗚～",
                    audio: "audio/page3_dialogue2.mp3"
                },
                {
                    character: "旁白",
                    text: "此時，昨晚夢遊與貓咪搶玩具的片段記憶湧了上來...",
                    audio: "audio/page3_dialogue3.mp3"
                },
                {
                    character: "艾莉絲",
                    text: "好吧，看來是我自己夢遊扔出去的... 糗大了！",
                    audio: "audio/page3_dialogue4.mp3"
                }
            ]
        }
    ]
};

// DOM 元素
const storyTitle = document.getElementById('storyTitle');
const mangaCard = document.getElementById('mangaCard');
const mangaImage = document.getElementById('mangaImage');
const dialogueList = document.getElementById('dialogueList');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const progressBarFill = document.getElementById('progressBarFill');
const currentChapter = document.getElementById('currentChapter');
const pageNumber = document.getElementById('pageNumber');
const audioPlayer = document.getElementById('audioPlayer');
const imageLoader = document.getElementById('imageLoader');

let currentIndex = 0;
let activeDialogueIndex = null; // 當前正在播放的對話 index
let isPlaying = false;
let characterColorMap = {}; // 用於分配角色顏色類別的 Map

// 初始化
function init() {
    storyTitle.textContent = mangaData.title;
    
    // 初始化角色顏色對照表
    let colorIndex = 0;
    mangaData.pages.forEach(page => {
        page.dialogues.forEach(d => {
            if (characterColorMap[d.character] === undefined) {
                characterColorMap[d.character] = colorIndex % 3;
                colorIndex++;
            }
        });
    });

    loadPage(currentIndex);
    
    // 事件監聽
    btnPrev.addEventListener('click', prevPage);
    btnNext.addEventListener('click', nextPage);

    // 音訊播放器事件
    audioPlayer.addEventListener('play', onAudioPlay);
    audioPlayer.addEventListener('pause', onAudioPause);
    audioPlayer.addEventListener('ended', onAudioEnded);
    audioPlayer.addEventListener('error', onAudioError);
}

// 載入指定頁面
function loadPage(pageIndex) {
    const page = mangaData.pages[pageIndex];
    if (!page) return;

    // 翻頁動畫：加上 fade-out 類別
    mangaCard.classList.add('fade-out');

    // 停止所有當前播放的聲音
    stopAudio();

    // 等待動畫過渡到一半 (200ms) 再更新內容
    setTimeout(() => {
        // 更新圖片，並顯示 loader
        imageLoader.classList.add('active');
        mangaImage.src = page.image;
        mangaImage.onload = () => {
            imageLoader.classList.remove('active');
        };
        mangaImage.onerror = () => {
            imageLoader.classList.remove('active');
            mangaImage.src = `https://placehold.co/600x600/1e293b/cbd5e1?text=Manga+Page+${pageIndex + 1}`;
        };

        // 更新章節與頁碼
        currentChapter.textContent = page.chapter;
        pageNumber.textContent = `${pageIndex + 1} / ${mangaData.pages.length}`;
        
        // 更新進度條
        const progressPercent = ((pageIndex + 1) / mangaData.pages.length) * 100;
        progressBarFill.style.width = `${progressPercent}%`;

        // 渲染對白列表
        renderDialogueList(page.dialogues);

        // 導覽按鈕狀態
        btnPrev.disabled = pageIndex === 0;
        btnNext.disabled = pageIndex === mangaData.pages.length - 1;

        // 翻頁動畫：移除 fade-out，加上 fade-in
        mangaCard.classList.remove('fade-out');
        mangaCard.classList.add('fade-in');

        // 動畫結束後移除 fade-in 類別，避免與下次動畫衝突
        setTimeout(() => {
            mangaCard.classList.remove('fade-in');
        }, 400);

    }, 200);
}

// 渲染對白列表
function renderDialogueList(dialogues) {
    dialogueList.innerHTML = '';
    activeDialogueIndex = null;

    dialogues.forEach((d, idx) => {
        const item = document.createElement('div');
        item.className = 'dialogue-item';
        item.dataset.index = idx;

        const charColorClass = `char-${characterColorMap[d.character] !== undefined ? characterColorMap[d.character] : 0}`;
        const defaultAudioPath = `audio/page${currentIndex + 1}_dialogue${idx + 1}.mp3`;
        const audioSrc = d.audio || defaultAudioPath;

        item.innerHTML = `
            <div class="dialogue-content">
                <span class="character-tag ${charColorClass}">${d.character}</span>
                <p class="character-text">${d.text}</p>
            </div>
            <button class="btn-dialogue-play" title="播放語音" aria-label="播放對白">
                <i class="fa-solid fa-play play-icon"></i>
                <div class="mini-wave">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </button>
        `;

        // 對白點擊整條或點擊播放鈕皆可觸發
        item.addEventListener('click', (e) => {
            // 防止按鈕觸發兩次事件
            if (e.target.closest('.btn-dialogue-play')) {
                e.stopPropagation();
            }
            playDialogue(idx, audioSrc, d.text);
        });

        // 獨立為播放按鈕加點擊事件 (主要是為了排他性)
        const playBtn = item.querySelector('.btn-dialogue-play');
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playDialogue(idx, audioSrc, d.text);
        });

        dialogueList.appendChild(item);
    });
}

// 播放指定對白
function playDialogue(dialogIndex, audioSrc, text) {
    const items = dialogueList.querySelectorAll('.dialogue-item');
    
    // 如果點擊的是正在播放的對白，則暫停
    if (activeDialogueIndex === dialogIndex && isPlaying) {
        audioPlayer.pause();
        // 如果是 WebSpeech，手動觸發 pause
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            onAudioPause();
        }
        return;
    }

    // 先停掉其他的
    stopAudio();

    activeDialogueIndex = dialogIndex;
    
    // 設定 active 視覺效果
    items.forEach((item, idx) => {
        if (idx === dialogIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // 播放音訊
    audioPlayer.src = audioSrc;
    audioPlayer.play().catch(err => {
        console.warn("實體 MP3 音訊播放失敗，使用 Web Speech API 作為備用播放方式：", err);
        useWebSpeechFallback(text, dialogIndex);
    });
}

// 停止當前音訊
function stopAudio() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    const items = dialogueList.querySelectorAll('.dialogue-item');
    items.forEach(item => item.classList.remove('active'));
    isPlaying = false;
}

// 翻頁控制
function prevPage() {
    if (currentIndex > 0) {
        currentIndex--;
        loadPage(currentIndex);
    }
}

function nextPage() {
    if (currentIndex < mangaData.pages.length - 1) {
        currentIndex++;
        loadPage(currentIndex);
    }
}

// 音訊播放器事件
function onAudioPlay() {
    isPlaying = true;
    updatePlayButtonUI(activeDialogueIndex, true);
}

function onAudioPause() {
    isPlaying = false;
    updatePlayButtonUI(activeDialogueIndex, false);
}

function onAudioEnded() {
    onAudioPause();
    // 移除 active 狀態
    const items = dialogueList.querySelectorAll('.dialogue-item');
    if (activeDialogueIndex !== null && items[activeDialogueIndex]) {
        items[activeDialogueIndex].classList.remove('active');
    }
    activeDialogueIndex = null;
}

function onAudioError() {
    // 雖然觸發 error，但 catch 已經捕獲並處理 fallback，故在此不做重複處理
}

// 更新播放按鈕 UI
function updatePlayButtonUI(dialogIndex, isPlayingAudio) {
    if (dialogIndex === null) return;
    const items = dialogueList.querySelectorAll('.dialogue-item');
    const targetItem = items[dialogIndex];
    if (!targetItem) return;

    const playIcon = targetItem.querySelector('.play-icon');
    
    if (isPlayingAudio) {
        targetItem.classList.add('active');
        if (playIcon) playIcon.className = "fa-solid fa-pause play-icon";
    } else {
        targetItem.classList.remove('active');
        if (playIcon) playIcon.className = "fa-solid fa-play play-icon";
    }
}

// 備用 Web Speech API 語音播放
function useWebSpeechFallback(text, dialogIndex) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-TW';
        utterance.rate = 1.0;
        
        utterance.onstart = () => {
            isPlaying = true;
            updatePlayButtonUI(dialogIndex, true);
        };
        
        utterance.onend = () => {
            isPlaying = false;
            updatePlayButtonUI(dialogIndex, false);
            const items = dialogueList.querySelectorAll('.dialogue-item');
            if (items[dialogIndex]) items[dialogIndex].classList.remove('active');
            activeDialogueIndex = null;
        };

        utterance.onerror = () => {
            isPlaying = false;
            updatePlayButtonUI(dialogIndex, false);
            const items = dialogueList.querySelectorAll('.dialogue-item');
            if (items[dialogIndex]) items[dialogIndex].classList.remove('active');
            activeDialogueIndex = null;
        };

        window.speechSynthesis.speak(utterance);
    }
}

// 啟動
document.addEventListener('DOMContentLoaded', init);
