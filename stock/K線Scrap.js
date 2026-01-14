const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// === Configuration ===
const CONFIG = {
  stocks: [
    '00981A',
    '0050',
    '2330',
    '2317',
    '2454',
    '2303',
    '3711',
    '2891',
    // Add more stock codes here
  ],
  
  outputDir: '/Volumes/32G/kline-screenshots',
  baseUrl: 'https://goodinfo.tw/tw/ShowK_Chart.asp?STOCK_ID=',
  
  // Recommended conservative settings
  delayBetweenRequestsMs: 18000,     // 18–25 seconds between requests
  timeoutPerPage: 45000,             // 45 seconds max per page
  viewport: { width: 1380, height: 920 },
  
  // Where to crop the chart area (adjust after testing)
  clip: {
    x: 20,
    y: 145,
    width: 1340,
    height: 680
  }
};

// Make sure output directory exists
async function ensureOutputDir() {
  try {
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
  } catch (e) {
    // already exists → ok
  }
}

async function captureStockChart(stockCode) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(CONFIG.viewport);

    const url = `${CONFIG.baseUrl}${stockCode}`;
    console.log(`→ Processing ${stockCode}  (${url})`);

    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: CONFIG.timeoutPerPage 
    });

    // Very important: give canvas enough time to fully render
    // await page.waitForTimeout(4800);           // 4.8 seconds
    await new Promise(resolve => setTimeout(resolve, 4800));
    await page.evaluate(() => new Promise(r => setTimeout(r, 800)));

    // Dynamically find the chart area (assuming it's a canvas or specific div)
    const chartClip = await page.evaluate(() => {
      // Try to find the main chart canvas or container
      const canvas = document.querySelector('canvas'); // Adjust selector if needed
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        return {
          x: Math.floor(rect.left),
          y: Math.floor(rect.top),
          width: Math.floor(rect.width),
          height: Math.floor(rect.height)
        };
      }
      // Fallback to manual clip if no canvas found
      return null;
    });

    const clipToUse = chartClip || CONFIG.clip;
    console.log(`Using clip: ${JSON.stringify(clipToUse)}`);

    const filename = path.join(
      CONFIG.outputDir, 
      `${stockCode}_${new Date().toISOString().slice(0,10)}.png`
    );

    // Option A: Full page screenshot (for testing clip coordinates)
    await page.screenshot({ path: filename.replace('.png', '_full.png'), fullPage: true });

    // Option B: Crop only chart area (cleaner result)
    await page.screenshot({
      path: filename,
      clip: clipToUse
    });

    console.log(`  ✓ Saved: ${filename}`);
    
    return true;

  } catch (error) {
    console.error(`  ✗ Failed ${stockCode}:`, error.message);
    return false;
  } finally {
    await browser.close();
  }
}

async function run() {
  await ensureOutputDir();
  
  console.log(`Starting capture of ${CONFIG.stocks.length} symbols...`);
  console.log('Date:', new Date().toLocaleString());
  console.log('----------------------------------------');

  for (const code of CONFIG.stocks) {
    await captureStockChart(code);
    // Important: polite delay between requests
    await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequestsMs));
  }

  console.log('\nAll tasks completed.');
}

run().catch(console.error);