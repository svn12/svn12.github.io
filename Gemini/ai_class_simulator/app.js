document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // Bind Select Helper values to text inputs
  const selectHelpers = document.querySelectorAll('.form-select-helper');
  selectHelpers.forEach(select => {
    select.addEventListener('change', () => {
      const targetId = select.getAttribute('data-target');
      const targetInput = document.getElementById(targetId);
      if (targetInput) {
        targetInput.value = select.value;
        select.selectedIndex = 0; // reset
      }
    });
  });

  /* ==========================================================================
     1. General Tab Navigation Logic (6 tabs now)
     ========================================================================== */
  const tabs = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');

      // Update Active Tab Button
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update Active Content Area
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `tab-${targetTab}`) {
          content.classList.add('active');
        }
      });

      // Special handling when switching to Camera tab to ensure canvas is sized correctly
      if (targetTab === 'camera') {
        setTimeout(initCanvas, 50);
      }
      
      // Special handling when switching to Devotion tab to load prompts
      if (targetTab === 'devotion') {
        renderDevotionPrompts(currentDevotionCat, currentDevotionFilter);
      }

      // Special handling when switching to Search tab to load history
      if (targetTab === 'search') {
        renderSearchHistory();
      }
    });
  });

  /* ==========================================================================
     2. Copy to Clipboard Utility & Toast Notification
     ========================================================================== */
  const toast = document.getElementById('toast');

  function showToast(message) {
    if (!toast) return;
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  const copyButtons = document.querySelectorAll('.btn-copy');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const textToCopy = document.getElementById(targetId).innerText;

      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="check"></i> 已複製！`;
        lucide.createIcons();
        btn.classList.add('btn-success');

        setTimeout(() => {
          btn.innerHTML = originalHTML;
          lucide.createIcons();
          btn.classList.remove('btn-success');
        }, 2000);
      }).catch(err => {
        console.error('無法複製文字: ', err);
      });
    });
  });

  /* ==========================================================================
     3. Interactive Prompt Generators (Course Tab)
     ========================================================================== */
  const btnGenFormula = document.getElementById('btn-gen-formula');
  if (btnGenFormula) {
    btnGenFormula.addEventListener('click', () => {
      const target = document.getElementById('formula-target').value;
      const scene = document.getElementById('formula-scene').value;
      const action = document.getElementById('formula-action').value;
      const mood = document.getElementById('formula-mood').value;

      const promptText = `請把這張照片中的人物呈現【${target}】的狀態，放在【${scene}】，正在做【${action}】，整體氛圍是【${mood}】。畫面要自然、溫馨、有故事感，像真實生活照片。臉要保持原本人物的樣子。`;
      document.getElementById('preview-formula-text').innerText = promptText;
    });
  }

  const btnGenStyle = document.getElementById('btn-gen-style');
  if (btnGenStyle) {
    btnGenStyle.addEventListener('click', () => {
      const art = document.getElementById('style-art').value;
      const people = document.getElementById('style-people').value;
      const item = document.getElementById('style-item').value;
      const location = document.getElementById('style-location').value;

      const promptText = `請幫我畫一張【${art}】的圖片，畫面中有一位【${people}】帶著【${item}】在【${location}】。`;
      document.getElementById('preview-style-text').innerText = promptText;
    });
  }


  /* ==========================================================================
     4. AI Style Camera / Canvas Filter Simulator
     ========================================================================== */
  const canvas = document.getElementById('editor-canvas');
  const ctx = canvas?.getContext('2d');
  const refImage = document.getElementById('ref-image');
  const loader = document.getElementById('loader');
  const progressBar = document.getElementById('progress-bar');
  const btnProcess = document.getElementById('btn-process-image');
  
  let currentImageSrc = 'assets/hike_sample.jpg';
  let selectedStyle = 'popart'; 
  let isUploadedImage = false;
  let uploadedImageObj = null;

  function initCanvas() {
    if (!canvas || !ctx) return;
    
    const img = isUploadedImage ? uploadedImageObj : refImage;
    if (!img || !img.complete) {
      if (img) img.onload = () => initCanvas();
      return;
    }

    const maxDimension = 800;
    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    canvas.width = width;
    canvas.height = height;

    ctx.filter = 'none';
    ctx.drawImage(img, 0, 0, width, height);
  }

  const sampleCards = document.querySelectorAll('.sample-img-card');
  const fileInput = document.getElementById('camera-upload-input');

  sampleCards.forEach(card => {
    card.addEventListener('click', () => {
      const src = card.getAttribute('data-src');
      
      if (src === 'upload') {
        fileInput.click();
      } else {
        sampleCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        currentImageSrc = src;
        isUploadedImage = false;
        refImage.src = src;
        refImage.onload = () => initCanvas();
      }
    });
  });

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          uploadedImageObj = new Image();
          uploadedImageObj.onload = () => {
            isUploadedImage = true;
            currentImageSrc = event.target.result;
            
            sampleCards.forEach(c => c.classList.remove('active'));
            const uploadCard = document.querySelector('[data-src="upload"]');
            if (uploadCard) uploadCard.classList.add('active');
            
            initCanvas();
          };
          uploadedImageObj.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const cameraStyleSelect = document.getElementById('camera-style-select');
  const styleBtns = document.querySelectorAll('.style-select-btn');

  styleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      styleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedStyle = btn.getAttribute('data-style');
      if (cameraStyleSelect) cameraStyleSelect.selectedIndex = 0;
    });
  });

  if (cameraStyleSelect) {
    cameraStyleSelect.addEventListener('change', () => {
      styleBtns.forEach(b => b.classList.remove('active'));
      selectedStyle = cameraStyleSelect.value;
    });
  }

  if (btnProcess) {
    btnProcess.addEventListener('click', () => {
      loader.classList.add('active');
      progressBar.style.width = '0%';

      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        progressBar.style.width = `${progress}%`;
        if (progress >= 100) {
          clearInterval(interval);
          applyStyleFilter(selectedStyle);
          setTimeout(() => {
            loader.classList.remove('active');
          }, 300);
        }
      }, 120); 
    });
  }

  function applyStyleFilter(style) {
    const img = isUploadedImage ? uploadedImageObj : refImage;
    if (!img || !ctx || !canvas) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.filter = 'none';
    ctx.clearRect(0, 0, w, h);

    if (style === 'popart') {
      const halfW = w / 2;
      const halfH = h / 2;
      const colorSchemes = [
        ['#ffff00', '#0000ff'], 
        ['#ff007f', '#ffff00'], 
        ['#38bdf8', '#ef4444'], 
        ['#10b981', '#0b0f19']  
      ];

      for (let i = 0; i < 4; i++) {
        const dx = (i % 2) * halfW;
        const dy = Math.floor(i / 2) * halfH;

        ctx.drawImage(img, dx, dy, halfW, halfH);

        const imgData = ctx.getImageData(dx, dy, halfW, halfH);
        const data = imgData.data;
        const bg = hexToRgb(colorSchemes[i][0]);
        const fg = hexToRgb(colorSchemes[i][1]);

        for (let j = 0; j < data.length; j += 4) {
          const r = data[j];
          const g = data[j+1];
          const b = data[j+2];
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          
          let factor = gray;
          if (gray < 100) factor = 0;
          else if (gray > 180) factor = 255;
          else factor = (gray - 100) * (255 / 80);

          const pct = factor / 255;
          data[j]   = fg.r + (bg.r - fg.r) * pct;
          data[j+1] = fg.g + (bg.g - fg.g) * pct;
          data[j+2] = fg.b + (bg.b - fg.b) * pct;
        }
        ctx.putImageData(imgData, dx, dy);

        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 4;
        ctx.strokeRect(dx, dy, halfW, halfH);
      }
    } 
    else if (style === 'clay') {
      ctx.filter = 'saturate(1.5) contrast(1.15) brightness(1.05) blur(1.5px)';
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = 'none';

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let j = 0; j < data.length; j += 4) {
        data[j]   = Math.round(data[j] / 51) * 51;
        data[j+1] = Math.round(data[j+1] / 51) * 51;
        data[j+2] = Math.round(data[j+2] / 51) * 51;
      }
      ctx.putImageData(imgData, 0, 0);

      ctx.globalAlpha = 0.15;
      ctx.drawImage(img, 0, 0, w, h);
      ctx.globalAlpha = 1.0;

      const gradient = ctx.createRadialGradient(w * 0.3, h * 0.3, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }
    else if (style === 'artnouveau') {
      ctx.filter = 'sepia(0.55) contrast(1.1) brightness(1.05) saturate(1.25)';
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = 'none';

      const padding = Math.min(w, h) * 0.05;
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 6;
      ctx.strokeRect(padding / 2, padding / 2, w - padding, h - padding);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(padding, padding, w - padding * 2, h - padding * 2);

      drawArtNouveauCorner(ctx, padding, padding, 0); 
      drawArtNouveauCorner(ctx, w - padding, padding, Math.PI / 2); 
      drawArtNouveauCorner(ctx, padding, h - padding, -Math.PI / 2); 
      drawArtNouveauCorner(ctx, w - padding, h - padding, Math.PI); 

      ctx.fillStyle = 'rgba(17, 24, 39, 0.8)';
      ctx.fillRect(padding, h - padding - 36, w - padding * 2, 36);

      ctx.fillStyle = '#fbbf24';
      ctx.font = `bold ${Math.max(12, Math.round(w * 0.03))}px ${getComputedStyle(document.body).fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText('溪頭一日健行 • 藝術寫真', w / 2, h - padding - 12);
    } 
    else if (style === 'ukiyoe') {
      ctx.filter = 'contrast(1.3) saturate(1.2) sepia(0.3)';
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, w, h);

      const stampSize = Math.max(30, Math.round(w * 0.07));
      const sx = w - stampSize - 20;
      const sy = 20;
      
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(sx, sy, stampSize, stampSize);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx + 3, sy + 3, stampSize - 6, stampSize - 6);
      
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.round(stampSize * 0.5)}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('美', sx + stampSize / 2, sy + stampSize / 1.45);
    } 
    else if (style === 'impressionism') {
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);

      const strokesCount = w * h * 0.08;
      const maxBrushSize = Math.max(8, w * 0.025);

      for (let k = 0; k < strokesCount; k++) {
        const rx = Math.floor(Math.random() * w);
        const ry = Math.floor(Math.random() * h);
        const idx = (ry * w + rx) * 4;
        const r = data[idx];
        const g = data[idx+1];
        const b = data[idx+2];
        const a = data[idx+3] / 255;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a * 0.85})`;
        ctx.beginPath();
        const radiusX = Math.random() * maxBrushSize + 2;
        const radiusY = Math.random() * (maxBrushSize / 2) + 1;
        const angle = Math.random() * Math.PI;
        ctx.ellipse(rx, ry, radiusX, radiusY, angle, 0, 2 * Math.PI);
        ctx.fill();
      }
    } 
    else if (style === 'vintage') {
      ctx.filter = 'sepia(0.85) contrast(0.8) brightness(0.95)';
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = 'none';

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        const startX = Math.random() * w;
        const startY = Math.random() * h;
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(
          startX + Math.random() * 40 - 20, 
          startY + Math.random() * 100 - 50,
          startX + Math.random() * 60 - 30, 
          startY + Math.random() * 200 - 100
        );
        ctx.stroke();
      }
      
      const gradient = ctx.createRadialGradient(w/2, h/2, Math.min(w,h) * 0.4, w/2, h/2, Math.max(w,h) * 0.7);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.65)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }
    else if (['chibi', 'line', 'sticker', 'dietsticker'].includes(style)) {
      ctx.filter = 'saturate(1.4) contrast(1.1) brightness(1.02)';
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = 'none';

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, w - 14, h - 14);
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(14, 14, w - 28, h - 28);
    }
    else if (['plushie', 'marshmallow', 'softanime', 'baby'].includes(style)) {
      ctx.filter = 'brightness(1.05) saturate(1.2) contrast(0.95)';
      ctx.drawImage(img, 0, 0, w, h);
      ctx.globalAlpha = 0.45;
      ctx.filter = 'blur(6px) brightness(1.1)';
      ctx.drawImage(canvas, 0, 0);
      ctx.globalAlpha = 1.0;
      ctx.filter = 'none';
    }
    else if (style === 'gummy') {
      ctx.filter = 'saturate(1.6) contrast(1.2) blur(0.5px)';
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = 'none';

      const grad = ctx.createRadialGradient(w * 0.25, h * 0.25, 5, w * 0.3, h * 0.3, w * 0.5);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.1)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
    else if (['watercolor', 'picturebook'].includes(style)) {
      ctx.filter = 'contrast(0.85) saturate(0.95) brightness(1.02)';
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = 'none';

      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 50 + 15, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    else if (['flat', 'infographic', 'geometric'].includes(style)) {
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let j = 0; j < data.length; j += 4) {
        data[j]   = Math.round(data[j] / 85) * 85;
        data[j+1] = Math.round(data[j+1] / 85) * 85;
        data[j+2] = Math.round(data[j+2] / 85) * 85;
      }
      ctx.putImageData(imgData, 0, 0);
    }
    else if (['korean', 'doodle', 'monochrome', 'graffiti', 'chalkboard'].includes(style)) {
      ctx.filter = 'contrast(1.6) grayscale(1.0)';
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = 'none';

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      const threshold = 120;
      for (let j = 0; j < data.length; j += 4) {
        const v = (data[j] + data[j+1] + data[j+2]) / 3;
        const color = v > threshold ? 255 : 0;
        data[j] = data[j+1] = data[j+2] = color;
      }
      ctx.putImageData(imgData, 0, 0);

      if (style === 'chalkboard') {
        const d = ctx.getImageData(0, 0, w, h).data;
        ctx.fillStyle = '#1e3a1e';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#ffffff';
        for (let y = 0; y < h; y += 2) {
          for (let x = 0; x < w; x += 2) {
            const idx = (y * w + x) * 4;
            if (d[idx] === 0) {
              ctx.fillRect(x, y, 1.5, 1.5);
            }
          }
        }
      }
    }
    else if (['retroanime', 'lightleak'].includes(style)) {
      ctx.filter = 'sepia(0.25) contrast(0.9) brightness(1.05) saturate(1.2)';
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = 'none';

      const gradient = ctx.createRadialGradient(w, h / 2, 10, w, h / 2, w * 0.8);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
      gradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.15)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }
    else if (['cyberpunk', 'vaporwave'].includes(style)) {
      ctx.filter = 'contrast(1.2) brightness(0.9) saturate(1.4)';
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = 'none';

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      for (let j = 0; j < data.length; j += 4) {
        const gray = 0.299 * data[j] + 0.587 * data[j+1] + 0.114 * data[j+2];
        data[j]   = Math.max(0, Math.min(255, gray + 60));
        data[j+1] = Math.max(0, Math.min(255, gray - 50));
        data[j+2] = Math.max(0, Math.min(255, gray + 140));
      }
      ctx.putImageData(imgData, 0, 0);
    }
    else if (['collage', 'washitape'].includes(style)) {
      ctx.drawImage(img, 0, 0, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(w, h);
      ctx.moveTo(w, 0); ctx.lineTo(0, h);
      ctx.stroke();
    }
    else if (style === 'botanical') {
      ctx.filter = 'saturate(1.2) contrast(1.05) hue-rotate(15deg)';
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = 'none';

      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.beginPath();
      ctx.ellipse(35, 35, 20, 8, Math.PI / 4, 0, 2 * Math.PI);
      ctx.ellipse(w - 35, h - 35, 20, 8, -Math.PI / 4, 0, 2 * Math.PI);
      ctx.fill();
    }
    else if (style === 'bread') {
      ctx.filter = 'sepia(0.35) contrast(1.1) brightness(0.96) saturate(1.35)';
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = 'none';
    }
    else if (['fashion', 'portrait', 'mascot', 'miniature', 'western', 'gamerender', 'socialfilter', 'poster'].includes(style)) {
      ctx.filter = 'contrast(1.15) brightness(1.02) saturate(1.22)';
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = 'none';

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 12;
      ctx.strokeRect(6, 6, w - 12, h - 12);
    }
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  function drawArtNouveauCorner(ctx, cx, cy, angle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.strokeStyle = '#f59e0b';
    ctx.fillStyle = '#f59e0b';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(15, 5, 20, 30, 5, 35);
    ctx.bezierCurveTo(-10, 40, -25, 20, -10, 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(18, 12, 6, 3, Math.PI / 4, 0, 2 * Math.PI);
    ctx.ellipse(6, 28, 5, 2, -Math.PI / 6, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }

  const btnDownload = document.getElementById('btn-download-img');
  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = `ai-style-portrait-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  }

  /* ==========================================================================
     5. Photo Wall Management (LocalStorage & Data Persistence)
     ========================================================================== */
  const photoWall = document.getElementById('photo-wall');
  const classPhotoCount = document.getElementById('class-photo-count');
  
  const defaultArtworks = [
    {
      id: 'default-1',
      uploader: '阿芬',
      prompt: '請把這張照片中的人物呈現【更快樂無憂】的狀態，放在【翠綠的溪頭森林步道中】，整體氛圍是【溫馨、陽光、有故事感】，臉要保持原本人物的樣子。',
      imageUrl: 'assets/pop_art_couple.jpg',
      styleName: '波普藝術',
      timestamp: '10分鐘前'
    },
    {
      id: 'default-2',
      uploader: '阿耀',
      prompt: '請幫我畫一張【新藝術風格】的圖片，畫面中有一位帶著笑容的紳士，在黃色蒸汽火車頭前。',
      imageUrl: 'assets/art_nouveau_train.jpg',
      styleName: '新藝術風格',
      timestamp: '25分鐘前'
    },
    {
      id: 'default-3',
      uploader: '美珠',
      prompt: '嬰兒時期的我，含著金湯匙出生，抓週照，舊相本質感，非常可愛的胖嘟嘟嬰兒。',
      imageUrl: 'assets/baby_gold_spoon.jpg',
      styleName: '時空穿越',
      timestamp: '38分鐘前'
    },
    {
      id: 'default-4',
      uploader: '黃子恬 Althea',
      prompt: '新一代美圖秀秀 - 不一樣的我！將人物轉化為數位插畫風格肖像畫。',
      imageUrl: 'assets/hike_sample.jpg',
      styleName: '數位插畫',
      timestamp: '1小時前'
    }
  ];

  function getArtworks() {
    const stored = localStorage.getItem('ai_class_artworks');
    if (!stored) {
      localStorage.setItem('ai_class_artworks', JSON.stringify(defaultArtworks));
      return defaultArtworks;
    }
    return JSON.parse(stored);
  }

  function saveArtwork(artwork) {
    const list = getArtworks();
    list.unshift(artwork);
    localStorage.setItem('ai_class_artworks', JSON.stringify(list));
    renderPhotoWall();
  }

  function renderPhotoWall() {
    if (!photoWall) return;

    const list = getArtworks();
    photoWall.innerHTML = '';
    
    if (classPhotoCount) {
      classPhotoCount.innerText = list.length;
    }

    list.forEach(art => {
      const card = document.createElement('div');
      card.className = 'photo-card';
      const firstLetter = art.uploader ? art.uploader.charAt(0) : 'A';

      card.innerHTML = `
        <div class="photo-card-img-wrapper">
          <img src="${art.imageUrl}" alt="${art.uploader} 的作品">
          <span class="style-indicator">${art.styleName}</span>
        </div>
        <div class="photo-card-body">
          <div class="photo-card-header">
            <div class="uploader-info">
              <div class="uploader-avatar">${firstLetter}</div>
              <div>
                <div class="uploader-name">${art.uploader}</div>
                <div class="upload-time">${art.timestamp}</div>
              </div>
            </div>
          </div>
          <div class="prompt-bubble">
            ${art.prompt}
          </div>
        </div>
      `;
      photoWall.appendChild(card);
    });
  }

  const wallForm = document.getElementById('wall-upload-form');
  const wallFileInput = document.getElementById('wall-file-input');
  const fileChosenText = document.getElementById('file-chosen-text');
  const thumbWrapper = document.getElementById('thumb-wrapper');
  const uploadThumbnail = document.getElementById('upload-thumbnail');
  
  let manualUploadBase64 = '';

  if (wallFileInput) {
    wallFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        fileChosenText.innerText = file.name;
        const reader = new FileReader();
        reader.onload = (event) => {
          manualUploadBase64 = event.target.result;
          uploadThumbnail.src = manualUploadBase64;
          thumbWrapper.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        fileChosenText.innerText = '尚未選擇檔案';
        thumbWrapper.style.display = 'none';
        manualUploadBase64 = '';
      }
    });
  }

  if (wallForm) {
    wallForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('uploader-name').value.trim();
      const prompt = document.getElementById('uploader-prompt').value.trim();

      if (!manualUploadBase64) {
        alert('請先選擇上傳的作品相片檔案！');
        return;
      }

      const newArt = {
        id: 'user-' + Date.now(),
        uploader: name,
        prompt: prompt || 'AI 藝術創作',
        imageUrl: manualUploadBase64,
        styleName: '自主上傳',
        timestamp: '剛剛'
      };

      saveArtwork(newArt);

      wallForm.reset();
      fileChosenText.innerText = '尚未選擇檔案';
      thumbWrapper.style.display = 'none';
      manualUploadBase64 = '';

      const wallSection = document.getElementById('photo-wall');
      if (wallSection) {
        wallSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  const btnClear = document.getElementById('btn-clear-storage');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (confirm('確定要將照片牆重設為預設作品嗎？這會清除您剛才上傳的內容。')) {
        localStorage.removeItem('ai_class_artworks');
        renderPhotoWall();
      }
    });
  }

  const styleNameMap = {
    popart: '波普藝術',
    artnouveau: '新藝術風格',
    clay: '3D黏土風',
    ukiyoe: '浮世繪',
    impressionism: '印象派',
    vintage: '復古老片',
    chibi: 'Q版貼紙風',
    line: 'LINE貼圖風',
    plushie: '毛絨娃娃風',
    chibi2: '半寫實Q版',
    marshmallow: '棉花糖空氣',
    gummy: '果凍軟糖風',
    watercolor: '溫暖手繪',
    picturebook: '森林繪本風',
    baby: '變裝寶寶風',
    flat: '扁平設計風',
    infographic: '資訊圖表風',
    korean: '韓系極簡線條',
    doodle: '塗鴉日記風',
    washitape: '紙膠帶拼貼',
    botanical: '植栽共生風',
    bread: '剛出爐麵包色',
    dietsticker: '實體貼紙風',
    chibi3: '半寫實Q版(自然)',
    chalkboard: '粉筆黑板畫',
    retroanime: '90s復古動漫',
    collage: '拼貼藝術',
    geometric: '幾何抽象風',
    cyberpunk: '賽博龐克',
    vaporwave: '迷幻蒸汽波',
    lightleak: '底片漏光感',
    portrait: '寫實人像風',
    mascot: '角色IP品牌',
    miniature: '微縮模型風',
    stopmotionclay: '黏土動畫風',
    softanime: '柔光戀愛風',
    western: '歐美劇場風',
    gamerender: '遊戲建模風',
    socialfilter: '濾鏡美顏風',
    poster: '海報插畫風',
    graffiti: '街頭塗鴉風',
    fashion: '時尚插畫風'
  };

  /* ==========================================================================
     6. Modal Publish Flow (From Camera Tab Directly to Wall)
     ========================================================================== */
  const publishModal = document.getElementById('publish-modal');
  const btnPublishTrigger = document.getElementById('btn-publish-wall-trigger');
  const btnModalClose = document.getElementById('btn-modal-close');
  const btnModalCancel = document.getElementById('btn-modal-cancel');
  const btnModalConfirm = document.getElementById('btn-modal-confirm');
  const modalPreviewImg = document.getElementById('modal-preview-img');
  
  if (btnPublishTrigger) {
    btnPublishTrigger.addEventListener('click', () => {
      const dataUrl = canvas.toDataURL();
      modalPreviewImg.src = dataUrl;

      const modalPromptInput = document.getElementById('modal-uploader-prompt');
      let curPrompt = '';
      if (selectedStyle !== 'vintage') {
        const styleName = styleNameMap[selectedStyle] || '指定風格';
        const people = document.getElementById('style-people').value.trim();
        const item = document.getElementById('style-item').value.trim();
        const location = document.getElementById('style-location').value.trim();
        curPrompt = `請幫我畫一張【${styleName}】的圖片，畫面中有一位【${people}】帶著【${item}】在【${location}】。`;
      } else {
        const target = document.getElementById('formula-target').value.trim();
        const scene = document.getElementById('formula-scene').value.trim();
        const action = document.getElementById('formula-action').value.trim();
        const mood = document.getElementById('formula-mood').value.trim();
        curPrompt = `請把這張照片中的人物呈現【${target}】的狀態，放在【${scene}】，正在做【${action}】，整體氛圍是【${mood}】。畫面要自然、溫馨、有故事感，像真實生活照片。臉要保持原本人物的樣子。`;
      }
      modalPromptInput.value = curPrompt;

      publishModal.classList.add('active');
    });
  }

  const closeModal = () => {
    publishModal?.classList.remove('active');
  };

  if (btnModalClose) btnModalClose.addEventListener('click', closeModal);
  if (btnModalCancel) btnModalCancel.addEventListener('click', closeModal);

  if (btnModalConfirm) {
    btnModalConfirm.addEventListener('click', () => {
      const name = document.getElementById('modal-uploader-name').value.trim();
      const prompt = document.getElementById('modal-uploader-prompt').value.trim();

      if (!name) {
        alert('請輸入您的名字！');
        return;
      }

      let displayStyleName = styleNameMap[selectedStyle] || 'AI 變身';

      const newArt = {
        id: 'user-cam-' + Date.now(),
        uploader: name,
        prompt: prompt || 'AI 藝術創作',
        imageUrl: canvas.toDataURL(),
        styleName: displayStyleName,
        timestamp: '剛剛'
      };

      saveArtwork(newArt);
      closeModal();

      tabs.forEach(t => t.classList.remove('active'));
      const wallTabBtn = document.querySelector('[data-tab="wall"]');
      if (wallTabBtn) wallTabBtn.classList.add('active');

      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === 'tab-wall') {
          content.classList.add('active');
        }
      });

      setTimeout(() => {
        const wallSection = document.getElementById('photo-wall');
        if (wallSection) {
          wallSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    });
  }


  /* ==========================================================================
     7. AI Devotion Companion Logic (Tab 5)
     ========================================================================== */
  const aiPlatforms = {
    gemini: { name: "Gemini", url: "https://gemini.google.com/app" },
    chatgpt: { name: "ChatGPT", url: "https://chatgpt.com" },
    claude: { name: "Claude", url: "https://claude.ai" },
    perplexity: { name: "Perplexity", url: "https://www.perplexity.ai" },
    grok: { name: "Grok", url: "https://grok.com" }
  };

  let currentAI = 'gemini';
  let currentDevotionCat = 'comfort';
  let currentDevotionFilter = 'all'; // For intercession dialect

  const devotionData = {
    comfort: [
      { title: "身體病痛時", text: "我今天身體很不舒服，心裡也很慌，請讀幾段醫治與平安的經文給我聽。" },
      { title: "自覺無用時", text: "我覺得老了身體沒用處了，心情很沮喪，請你跟我說一些鼓勵的話。" },
      { title: "痛到失眠時", text: "今晚我痛到睡不著，能不能陪我聊聊天，並用一段禱告結束？" },
      { title: "感到孤單時", text: "孩子們都很忙沒空回來，我一個人覺得很孤單，請跟我說說聖經裡關於神陪伴我們的故事。" },
      { title: "擔憂孫輩時", text: "我很擔心孫子的前途，心裡放不下，請給我一段能讓我放下焦慮的經文。" },
      { title: "想念老伴時", text: "我想念過世的老伴了，心裡酸酸的，請讀一段關於天家盼望的話給我聽。" },
      { title: "心靜不下來時", text: "我覺得最近生活壓力很大，心靜不下來，請帶領我做一個簡單的深呼吸靈修。" },
      { title: "迷惘未來時", text: "我對未來感到很迷惘，請告訴我神對我的生命還有什麼美好的計畫嗎？" },
      { title: "家中糾紛時", text: "請幫我寫一段簡短的禱告詞，求神賜給我智慧與耐心去面對家裡的糾紛。" },
      { title: "凡事謝恩時", text: "我今天覺得很有福氣，想感謝神，請陪我一起數算恩典，說說我們可以感謝神的事。" }
    ],
    scripture: [
      { title: "老年衰退 (詩71:9)", text: "讀詩篇 71:9 給我聽，並解釋神怎麼看我們老年的時候？" },
      { title: "家事忙碌 (馬大與馬利亞)", text: "我想聽馬大與馬利亞的故事，為什麼耶穌叫馬大不要忙了？" },
      { title: "教養孩童 (箴22:6)", text: "箴言22:6說教養孩童使他走當行的道，但我現在還能做什麼？" },
      { title: "明日憂慮 (太6:34)", text: "我不懂什麼是『一天的難處一天當』？耶穌在想什麼？" },
      { title: "愛的意義 (林前13)", text: "解釋哥林多前書13章的愛，對我們這種年紀的人有什麼新意義？" },
      { title: "死蔭幽谷 (詩23)", text: "解釋詩篇23篇的『死蔭幽谷』是什麼？神真的在那裡嗎？" },
      { title: "過去悔恨 (約一1:9)", text: "讀約翰一書1:9，我以前做錯的事，現在求神原諒還來得及嗎？" },
      { title: "常常喜樂 (帖前5:16)", text: "為什麼聖經說『要常常喜樂，不住禱告』？我病都沒好怎麼喜樂？" },
      { title: "生命末了 (提後4:7)", text: "解釋保羅說的『美好的仗我已經打過了』，這對我有什麼安慰？" },
      { title: "萬事互相效力 (羅8:28)", text: "羅馬書8:28說萬事互相效力，壞事也是嗎？" }
    ],
    intercession: [
      { type: "cn", title: "病友康復 (國語)", text: "幫我寫一段簡短的關懷短訊給王姊妹，她最近開完刀，求神醫治她，並祝她早日康復。" },
      { type: "cn", title: "痛失親人 (國語)", text: "林弟兄的老伴最近過世了，請幫我寫一段溫暖貼心的安慰短訊，告訴他我們都在為他代禱。" },
      { type: "cn", title: "子女工作 (國語)", text: "我孩子最近工作壓力大、很常加班。請寫一段溫柔的祝福禱告文，祝他出入平安、工作有智慧。" },
      { type: "cn", title: "家庭和睦 (國語)", text: "家裡最近有些爭執，請寫一個求神賜下平安與和睦的禱告文，讓我們能彼此包容。" },
      { type: "cn", title: "小組開場 (國語)", text: "幫我寫一段明天晚上小組聚會的開場禱告，語調要親切、熱情，歡迎新朋友。" },
      { type: "tw", title: "身體無爽快 (台語)", text: "王姊妹平安！聽講妳這幾日身體卡無爽快，我有替妳求主耶穌，保庇妳早日清氣、身體勇健。咱的神是咱隨時的幫助，妳要安心休養喔！" },
      { type: "tw", title: "心裡憂慮 (台語)", text: "老朋友，煩惱的事就交給主，嘸通自己擔。願主賜給妳平安的心，讓妳好睏、好眠。主耶穌惜妳，我也在遮替妳祈禱。" },
      { type: "tw", title: "感謝照顧 (台語)", text: "李姊妹，感謝妳送來的物件，誠好食！謝謝妳這款體貼。願主加倍賜福給妳全家，恩典滿滿喔！" },
      { type: "tw", title: "邀請聚會 (台語)", text: "這禮拜的小組聚會真精彩，大家攏真想妳。若有空作夥來坐，聽神的話，心情會變真好，等妳喔！" },
      { type: "tw", title: "囝仔做事業 (台語)", text: "乖兒，聽講你最近工作真無閒，壓力嘛大。阿母有替你祈禱，求主賜你智慧，出入攏平安，身體要顧好喔！" }
    ],
    prayerq: [
      { title: "為什麼神不聽我的病痛禱告？", text: "我每天都為了我的病痛迫切禱告，可是為什麼一直都沒有好轉？神真的有聽到我的聲音嗎？請用聖經的觀點安慰我。" },
      { title: "年紀大了，在教會還能做什麼？", text: "我現在年紀大了，體力不好，不像年輕人可以做那麼多服事。在神眼中，我還有什麼價值？我還能為教會做些什麼？" },
      { title: "面對死亡的陰影感到害怕...", text: "看到身邊同齡的朋友一個個離開，想到自己有天也要面對死亡，心裡總是有點害怕。請跟我說說聖經對天家的應許，讓我心裡有真正的平安。" },
      { title: "要怎麼原諒傷害過我的家人？", text: "過去家裡有些事讓我受過很大的傷害，心裡一直放不下。雖然知道聖經教我們要饒恕，但我該怎麼做才能真的放下心中的怨恨？" }
    ],
    gems: [
      { 
        title: "漫影煉金：二階段成語漫機", 
        text: "【核心定位】你是一位資深 AI 漫畫顧問，專門將成語轉化為具備 '現代諷刺感' 彩色漫畫。Phase 1：創意核准，接收成語後產出 3 個現代改編方案（A/B/C）。Phase 2：用戶確認後，輸出 4-6 格分鏡腳本並呼叫生圖。" 
      },
      { 
        title: "直播片頭背景圖 AI 專家", 
        text: "# 角色設定：基督教視覺傳達創意總監。任務：根據經文與主題產出「10 個視覺意象建議表」並包含 Unsplash 連結。第二階段：用戶輸入 [1-10] 觸發生成 16:9 cinematic 電影攝影風格無文字背景圖。" 
      },
      { 
        title: "每日靈修、全域財經科技報導", 
        text: "每日產出結構化簡報。包含：1) 心靈補給：基督教靈修心得。2) 全域財經：整理過去24小時全球、台灣財經新聞（事件、立場、影響）並附來源連結。3) AI科技趨勢新聞。" 
      },
      { 
        title: "個人 IP 圖像設計專家 (16宮格)", 
        text: "引導分析照片關鍵特徵。輸入 [1-18] 生成對應風格的 4x4 純白背景 IP 網格圖。輸入 [L+數字] 將原照片轉換為單張指定風格肖像。輸入 [p] 生成 4x3 職場表情網格圖。" 
      }
    ],
    setup: [
      { title: "讓你的 AI 助手稱呼你為『李大哥』", text: "請記得在接下來的對話中，一律稱呼我為『李大哥』，並且說話語調要親切、有耐心，多用溫暖的語氣來回答我的問題。" },
      { title: "要求回答簡單易懂、字體放大", text: "請把我當作一位 70 歲的長者，回答問題時請用簡單直白的話，不要用太多英文字或複雜的科技術語，段落要分明，字數不要太多。" }
    ]
  };

  // AI Selector buttons interaction
  const platformBtns = document.querySelectorAll('.platform-btn');
  platformBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      platformBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAI = btn.getAttribute('data-platform');
      
      // Re-render current category to update button labels
      renderDevotionPrompts(currentDevotionCat, currentDevotionFilter);
    });
  });

  // Category switch for devotion
  const devotionCatBtns = document.querySelectorAll('.devotion-nav-btn');
  devotionCatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      devotionCatBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDevotionCat = btn.getAttribute('data-cat');

      // Show intercession sub-filter only for 'intercession' category
      const filterBar = document.getElementById('intercession-filter-bar');
      if (filterBar) {
        filterBar.style.display = (currentDevotionCat === 'intercession') ? 'flex' : 'none';
      }

      renderDevotionPrompts(currentDevotionCat, currentDevotionFilter);
    });
  });

  // Intercession dialect filters
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDevotionFilter = btn.getAttribute('data-filter');
      renderDevotionPrompts('intercession', currentDevotionFilter);
    });
  });

  // Render function for Devotion Tab cards
  function renderDevotionPrompts(category, filter = 'all') {
    const grid = document.getElementById('devotion-prompts-grid');
    if (!grid) return;

    grid.innerHTML = '';
    let dataList = devotionData[category] || [];

    // Filter intercession
    if (category === 'intercession' && filter !== 'all') {
      dataList = dataList.filter(item => item.type === filter);
    }

    if (dataList.length === 0) {
      grid.innerHTML = '<div class="card" style="grid-column: span 3; text-align:center; color:var(--text-muted);">無相關指令</div>';
      return;
    }

    dataList.forEach(item => {
      const card = document.createElement('div');
      card.className = 'devotion-card';

      // Set badge style
      let tagClass = 'tag-normal';
      let tagLabel = category.toUpperCase();
      if (item.type === 'tw') { tagClass = 'tag-tw'; tagLabel = '台語口吻'; }
      else if (item.type === 'cn') { tagClass = 'tag-cn'; tagLabel = '國語口吻'; }
      else if (category === 'gems') { tagClass = 'tag-gems'; tagLabel = 'Gems'; }
      else if (category === 'comfort') tagLabel = '尋求安慰';
      else if (category === 'scripture') tagLabel = '經文解讀';
      else if (category === 'prayerq') tagLabel = '常見提問';
      else if (category === 'setup') tagLabel = '設定';

      const platformInfo = aiPlatforms[currentAI];

      card.innerHTML = `
        <div>
          <div class="devotion-card-header">
            <h3 class="devotion-card-title">${item.title}</h3>
            <span class="devotion-tag ${tagClass}">${tagLabel}</span>
          </div>
          <div class="devotion-prompt-text" id="prompt-txt-${category}-${cleanString(item.title)}">${item.text}</div>
        </div>
        <div class="devotion-card-actions">
          <button class="btn btn-primary btn-sm btn-copy-platform" data-text="${encodeURIComponent(item.text)}">
            <i data-lucide="copy"></i> 複製並前往 ${platformInfo.name}
          </button>
        </div>
      `;

      grid.appendChild(card);
    });

    // Re-bind click events for newly created devotion copy buttons
    bindDevotionCopyButtons();
    lucide.createIcons();
  }

  function cleanString(str) {
    return str.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '');
  }

  function bindDevotionCopyButtons() {
    const copyPlatBtns = document.querySelectorAll('.btn-copy-platform');
    copyPlatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const text = decodeURIComponent(btn.getAttribute('data-text'));
        const platformInfo = aiPlatforms[currentAI];

        // Copy
        navigator.clipboard.writeText(text).then(() => {
          showToast(`指令已複製！即將前往 ${platformInfo.name}...`);
          
          // Open AI Platform in new tab after a brief delay
          setTimeout(() => {
            window.open(platformInfo.url, '_blank');
          }, 800);
        }).catch(err => {
          console.error('複製失敗: ', err);
        });
      });
    });
  }


  /* ==========================================================================
     8. Multi-Search Hub Logic (Tab 6)
     ========================================================================== */
  const searchUrls = {
    // AI Tools
    perplexity: { search: "https://www.perplexity.ai/?q=", home: "https://www.perplexity.ai" },
    colpilot: { search: "https://copilot.microsoft.com/?q=", home: "https://copilot.microsoft.com" },
    chatgpt: { search: "https://chatgpt.com/?q=", home: "https://chatgpt.com" },
    bard: { search: "https://gemini.google.com/app/search?q=", home: "https://gemini.google.com/app" },
    claude: { search: "https://claude.ai/new?q=", home: "https://claude.ai/new" },
    grok: { search: "https://grok.com/?q=", home: "https://grok.com" },
    deepseek: { search: "https://chat.deepseek.com/?q=", home: "https://chat.deepseek.com" },
    doubao: { search: "https://www.doubao.com/chat/?q=", home: "https://www.doubao.com" },
    felo_ai: { search: "https://felo.ai/search?q=", home: "https://felo.ai" },
    studio_global: { search: "https://app.studioglobal.ai/search?q=", home: "https://app.studioglobal.ai" },
    poe: { search: "https://poe.com/search?q=", home: "https://poe.com" },
    huggingface: { search: "https://huggingface.co/spaces/huggingface-projects/llama-2-13b-chat?q=", home: "https://huggingface.co" },
    notegpt: { search: "https://notegpt.io/search?q=", home: "https://notegpt.io" },
    google_ai_studio: { search: "https://aistudio.google.com/", home: "https://aistudio.google.com/" },
    max_ai: { search: "https://www.maxai.me/", home: "https://www.maxai.me/" },
    ChatGLM: { search: "https://chatglm.cn/main/gdetail/5f97977054f15d2a23ebccfa?q=", home: "https://chatglm.cn" },
    yiyan: { search: "https://yiyan.baidu.com/", home: "https://yiyan.baidu.com/" },
    kimi: { search: "https://kimi.moonshot.cn/", home: "https://kimi.moonshot.cn/" },
    NBklm: { search: "https://notebooklm.google.com/", home: "https://notebooklm.google.com/" },
    lovable: { search: "https://lovable.dev/", home: "https://lovable.dev/" },

    // Search Engines
    google: { search: "https://www.google.com/search?q=", home: "https://www.google.com" },
    bing: { search: "https://www.bing.com/search?q=", home: "https://www.bing.com" },
    duckduckgo: { search: "https://duckduckgo.com/?q=", home: "https://duckduckgo.com" },
    yahoo: { search: "https://tw.search.yahoo.com/search?p=", home: "https://tw.yahoo.com" },
    baidu: { search: "https://www.baidu.com/s?wd=", home: "https://www.baidu.com" },
    萌典: { search: "https://www.moedict.tw/", home: "https://www.moedict.tw" },
    找台語: { search: "https://chhoe.taigi.info/search.jsp?keyword=", home: "https://chhoe.taigi.info" },
    itaigi: { search: "https://itaigi.tw/k/", home: "https://itaigi.tw" },
    台語辭典: { search: "https://sutian.moe.edu.tw/und-hani/tshiau/?lui=tai_su&tsha=", home: "https://sutian.moe.edu.tw" },
    客語辭典: { search: "https://hakkadict.moe.edu.tw/search?q=", home: "https://hakkadict.moe.edu.tw" },

    // News
    udn: { search: "https://udn.com/search/word/2/", home: "https://udn.com" },
    chinatimes: { search: "https://www.chinatimes.com/search/", home: "https://www.chinatimes.com" },
    ltn: { search: "https://search.ltn.com.tw/list?keyword=", home: "https://search.ltn.com.tw" },
    ettoday: { search: "https://www.ettoday.net/news_search/doSearch.php?keywords=", home: "https://www.ettoday.net" },
    yahoo_news: { search: "https://tw.news.yahoo.com/search?p=", home: "https://tw.news.yahoo.com" },
    cna: { search: "https://www.cna.com.tw/search/hysearchws.aspx?q=", home: "https://www.cna.com.tw" },
    google_news: { search: "https://news.google.com/search?q=", home: "https://news.google.com" },

    // Images
    freepik: { search: "https://www.freepik.com/search?query=", home: "https://www.freepik.com" },
    Pexels: { search: "https://www.pexels.com/zh-tw/search/", home: "https://www.pexels.com" },
    Pixabay: { search: "https://pixabay.com/zh/images/search/", home: "https://pixabay.com" },
    Unsplash: { search: "https://unsplash.com/s/photos/", home: "https://unsplash.com" },
    FreeImages: { search: "https://www.freeimages.com/search/", home: "https://www.freeimages.com" },
    cc0_fengjing: { search: "https://cc0.cn/image/fengjing/", home: "https://cc0.cn/image/fengjing/" },
    NASA_APOD: { search: "https://apod.nasa.gov/apod/astropix.html", home: "https://apod.nasa.gov/apod/astropix.html" },
    wiki_daily: { search: "https://zh.m.wikipedia.org/zh-tw/Wikipedia:%E6%AF%8F%E6%97%A5%E5%9B%BE%E7%89%87", home: "https://zh.m.wikipedia.org/zh-tw/Wikipedia:%E6%AF%8F%E6%97%A5%E5%9B%BE%E7%89%87" },
    photo_ac: { search: "https://zh-tw.photo-ac.com/", home: "https://zh-tw.photo-ac.com/" },

    // Shopping
    momo: { search: "https://www.momoshop.com.tw/search/searchShop.jsp?keyword=", home: "https://www.momoshop.com.tw" },
    shopee: { search: "https://shopee.tw/search?keyword=", home: "https://shopee.tw" },
    pchome24: { search: "https://ecshweb.pchome.com.tw/search/v3.3/?q=", home: "https://shopping.pchome.com.tw" },
    yahoo_shop: { search: "https://tw.buy.yahoo.com/search/product?p=", home: "https://tw.buy.yahoo.com" },
    ruten: { search: "https://www.ruten.com.tw/find/?q=", home: "https://www.ruten.com.tw" },
    books: { search: "https://www.books.com.tw/web/sys_search?key=", home: "https://www.books.com.tw" },
    etmall: { search: "https://www.etmall.com.tw/Search?keyword=", home: "https://www.etmall.com.tw" },
    rakuten: { search: "https://www.rakuten.com.tw/search/", home: "https://www.rakuten.com.tw" },
    coupang: { search: "https://www.coupang.com.tw/search?q=", home: "https://www.coupang.com.tw" },
    fridays: { search: "https://shopping.friday.tw/ec2/search?sid=&hotKey=", home: "https://shopping.friday.tw" },
    鮮拾: { search: "https://www.10mart.com.tw/v2/Search?q=", home: "https://www.10mart.com.tw" },
    信源電器: { search: "https://www.xinyuan.com.tw/index.php?q=", home: "https://www.xinyuan.com.tw" },
    findprice: { search: "https://www.findprice.com.tw/g/", home: "https://www.findprice.com.tw" },
    priceTW: { search: "https://biggo.com.tw/s/?q=", home: "https://biggo.com.tw" },
    ezprice: { search: "https://feebee.com.tw/s/?q=", home: "https://feebee.com.tw" },
    sogi: { search: "https://www.sogi.com.tw/search?q=", home: "https://www.sogi.com.tw" },
    eprice: { search: "https://www.eprice.com.tw/search/?q=", home: "https://www.eprice.com.tw" },
    findbook: { search: "https://findbook.tw/search?q=", home: "https://findbook.tw" },
    funtime: { search: "https://www.funtime.com.tw/search.php?q=", home: "https://www.funtime.com.tw" },
    taiwango: { search: "https://www.taiwango.com.tw/search?q=", home: "https://www.taiwango.com.tw" },
    backpackers: { search: "https://www.backpackers.com.tw/forum/sitesearch.php?q=", home: "https://www.backpackers.com.tw" },
    agoda: { search: "https://www.agoda.com/zh-tw/search?asq=", home: "https://www.agoda.com" },
    booking: { search: "https://www.booking.com/searchresults.html?ss=", home: "https://www.booking.com" },
    trip: { search: "https://tw.trip.com/search/?keyword=", home: "https://tw.trip.com" },

    // Music
    Suno: { search: "https://suno.com/create", home: "https://suno.com" },
    Genape: { search: "https://app.genape.ai/chatApe", home: "https://app.genape.ai" },
    Aiva: { search: "https://creators.aiva.ai/", home: "https://creators.aiva.ai/" },
    Veedio: { search: "https://www.veed.io/", home: "https://www.veed.io/" },
    Napkin: { search: "https://app.napkin.ai/", home: "https://app.napkin.ai/" },

    // Art Gen
    Midjourney: { search: "https://www.midjourney.com", home: "https://www.midjourney.com" },
    BingArt: { search: "https://www.bing.com/images/create?q=", home: "https://www.bing.com/images/create" },
    ideogram: { search: "https://ideogram.ai/", home: "https://ideogram.ai/" },
    Recraft: { search: "https://www.recraft.ai/", home: "https://www.recraft.ai/" },
    klingai: { search: "https://klingai.com/", home: "https://klingai.com/" },
    dreamina: { search: "https://dreamina.capcut.com/", home: "https://dreamina.capcut.com/" },
    Leonardo: { search: "https://leonardo.ai/", home: "https://leonardo.ai/" },
    Raphael: { search: "https://artbreeder.com/", home: "https://artbreeder.com/" },
    Playground: { search: "https://playground.com/", home: "https://playground.com/" },
    Writesonic: { search: "https://writesonic.com/", home: "https://writesonic.com/" },
    Simplified: { search: "https://simplified.com/ai-image-generator/", home: "https://simplified.com" },
    LovoAI: { search: "https://lovo.ai/", home: "https://lovo.ai/" },
    Artguru: { search: "https://www.artguru.ai/", home: "https://www.artguru.ai/" },
    NightCafe_Creator: { search: "https://creator.nightcafe.studio/", home: "https://creator.nightcafe.studio/" },
    Magic_Studio: { search: "https://magicstudio.com/", home: "https://magicstudio.com/" },
    Craiyon: { search: "https://www.craiyon.com/?q=", home: "https://www.craiyon.com" },
    Hotpot_AI: { search: "https://hotpot.ai/", home: "https://hotpot.ai/" },
    DeepAI: { search: "https://deepai.org/machine-learning-model/text2img", home: "https://deepai.org" },
    Fotor: { search: "https://www.fotor.com/features/ai-image-generator/", home: "https://www.fotor.com" },
    OpenArt: { search: "https://openart.ai/", home: "https://openart.ai/" },
    Pixverse: { search: "https://pixverse.ai/", home: "https://pixverse.ai/" },
    clipdrop: { search: "https://clipdrop.co/", home: "https://clipdrop.co/" },
    photo_to_anime: { search: "https://www.imglarger.com/", home: "https://www.imglarger.com/" }
  };

  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const searchHistoryList = document.getElementById('search-history-list');
  const historySectionWrapper = document.getElementById('history-section-wrapper');

  // Load Search History from localStorage
  let searchHistory = JSON.parse(localStorage.getItem('gemini_search_history')) || [];

  // Toggle X clear button visibility
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      toggleClearButton();
    });
  }

  function toggleClearButton() {
    if (!searchClearBtn || !searchInput) return;
    searchClearBtn.style.display = (searchInput.value.trim().length > 0) ? 'flex' : 'none';
  }

  // Clear Input Box
  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      toggleClearButton();
      searchInput.focus();
    });
  }

  // Handle Search Platform button clicks
  const searchButtons = document.querySelectorAll('.search-btn');
  searchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const engine = btn.getAttribute('data-engine');
      const config = searchUrls[engine];
      if (!config) return;

      const val = searchInput ? searchInput.value.trim() : '';

      if (val.length > 0) {
        // Save Search History
        addToHistory(val);
        
        // Open search page
        window.open(config.search + encodeURIComponent(val), '_blank');
      } else {
        // Open homepage
        window.open(config.home, '_blank');
      }
    });
  });

  // Add items to history list
  function addToHistory(text) {
    // Filter duplicates
    searchHistory = searchHistory.filter(h => h.text !== text);
    searchHistory.unshift({
      text: text,
      time: Date.now()
    });

    // Cap at 15 items
    if (searchHistory.length > 15) {
      searchHistory.pop();
    }

    localStorage.setItem('gemini_search_history', JSON.stringify(searchHistory));
    renderSearchHistory();
  }

  // Render history list cards
  function renderSearchHistory() {
    if (!searchHistoryList || !historySectionWrapper) return;

    if (searchHistory.length === 0) {
      historySectionWrapper.style.display = 'none';
      return;
    }

    historySectionWrapper.style.display = 'block';
    searchHistoryList.innerHTML = '';

    searchHistory.forEach((item, index) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';

      historyItem.innerHTML = `
        <span class="history-text">${item.text}</span>
        <button class="history-del-btn" data-index="${index}"><i data-lucide="x"></i></button>
      `;

      // Click on text auto-populates search box
      historyItem.querySelector('.history-text').addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = item.text;
          toggleClearButton();
          searchInput.focus();
        }
      });

      // Click on X deletes single history
      historyItem.querySelector('.history-del-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteHistoryItem(index);
      });

      searchHistoryList.appendChild(historyItem);
    });

    lucide.createIcons();
  }

  function deleteHistoryItem(index) {
    searchHistory.splice(index, 1);
    localStorage.setItem('gemini_search_history', JSON.stringify(searchHistory));
    renderSearchHistory();
  }

  // Clear all search history
  const btnClearHistory = document.getElementById('btn-clear-history');
  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', () => {
      if (confirm('確定要清空所有搜尋歷史紀錄嗎？')) {
        searchHistory = [];
        localStorage.removeItem('gemini_search_history');
        renderSearchHistory();
      }
    });
  }

  /* ==========================================================================
     9. Initialization & Load
     ========================================================================== */
  // Render Photo Wall on start
  renderPhotoWall();

  // Load default canvas after short delay
  setTimeout(initCanvas, 100);
});
