import json
import os
import pandas as pd
import datetime

# 將 PROJECT_DIR 設為相對路徑，適用於 GitHub Actions 環境
PROJECT_DIR = '.'
PUBLIC_DIR = os.path.join(PROJECT_DIR, 'public')
EXCEL_PATH = os.path.join(PROJECT_DIR, 'output/591_rent_list.xlsx')

if not os.path.exists(PUBLIC_DIR):
    os.makedirs(PUBLIC_DIR)

def main():
    # 讀取舊的 rentals 以防抓取失敗時作為快取備份
    old_rentals = []
    json_path = os.path.join(PUBLIC_DIR, 'data.json')
    backup_path = os.path.join(PROJECT_DIR, 'Gemini/591_rent_list/data.json')
    
    load_path = json_path
    if not os.path.exists(load_path) and os.path.exists(backup_path):
        load_path = backup_path
        
    if os.path.exists(load_path):
        try:
            with open(load_path, 'r', encoding='utf-8') as f:
                old_data = json.load(f)
                old_rentals = old_data.get('rentals', [])
        except Exception as e:
            print(f"讀取舊 data.json ({load_path}) 失敗: {e}")

    rentals = []
    if os.path.exists(EXCEL_PATH):
        try:
            df = pd.read_excel(EXCEL_PATH)
            df = df.fillna('')
            for idx, row in df.iterrows():
                rentals.append({
                    "district": str(row.get('行政區', '')),
                    "title": str(row.get('名稱', '')),
                    "kind": str(row.get('類型', '')),
                    "price": str(row.get('租金', '')),
                    "price_contain": str(row.get('租金包含', '')),
                    "size_floor": str(row.get('大小 / 樓層', '')),
                    "address": str(row.get('地址', '')),
                    "refresh_time": str(row.get('何時更新', '')),
                    "yesterday_views": str(row.get('昨日瀏覽人數', '')),
                    "cover_img": str(row.get('封面照片網址', '')),
                    "url": str(row.get('連結', ''))
                })
        except Exception as e:
            print(f"讀取 Excel 失敗: {e}")
    else:
        print(f"警告: 找不到 {EXCEL_PATH}")
        
    is_cached = False
    if len(rentals) == 0:
        if len(old_rentals) > 0:
            rentals = old_rentals
            is_cached = True
            print(f"警告: 本次抓取資料為空，已載入 {len(rentals)} 筆歷史快取資料。")
        else:
            print("警告: 本次抓取資料為空，且無歷史快取資料。")

    # 抓取時間 (設定時區為台北時間 UTC+8)
    tz_taipei = datetime.timezone(datetime.timedelta(hours=8))
    now_str = datetime.datetime.now(tz_taipei).strftime('%Y-%m-%d %H:%M:%S')
    
    # 讀取 debug 日誌
    debug_logs = []
    debug_path = os.path.join(PROJECT_DIR, 'output/debug_log.json')
    if os.path.exists(debug_path):
        try:
            with open(debug_path, 'r', encoding='utf-8') as f:
                debug_logs = json.load(f)
        except Exception as e:
            debug_logs = [f"讀取 debug_log.json 失敗: {e}"]
            
    data_payload = {
        "fetched_time": now_str,
        "rentals": rentals,
        "debug_logs": debug_logs,
        "is_cached": is_cached
    }
    
    # 寫入 data.json
    json_path = os.path.join(PUBLIC_DIR, 'data.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data_payload, f, ensure_ascii=False, indent=2)
    print(f"成功生成 {json_path}，共 {len(rentals)} 筆資料，附帶 {len(debug_logs)} 筆 debug 資訊。")
    
    # 建立 index.html (包含中正區選項)
    html_content = """<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>591 租屋網 - 松山/大安/中正優質套房特搜</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Noto+Sans+TC:wght@300;400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0f172a;
            --card-bg: rgba(30, 41, 59, 0.7);
            --border-color: rgba(255, 255, 255, 0.08);
            --text-color: #e2e8f0;
            --text-muted: #94a3b8;
            --primary: #f97316;
            --primary-glow: rgba(249, 115, 22, 0.15);
            --success: #10b981;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Outfit', 'Noto Sans TC', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            line-height: 1.6;
            padding-bottom: 50px;
            background-image: radial-gradient(circle at 10% 20%, rgba(120, 50, 10, 0.15) 0%, transparent 45%),
                              radial-gradient(circle at 90% 80%, rgba(20, 80, 120, 0.15) 0%, transparent 45%);
            background-attachment: fixed;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        header {
            margin-bottom: 40px;
            padding: 30px;
            background: rgba(30, 41, 59, 0.4);
            backdrop-filter: blur(16px);
            border-radius: 24px;
            border: 1px solid var(--border-color);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
            text-align: center;
        }

        h1 {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #fff 30%, #f97316 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }

        .meta-info {
            color: var(--text-muted);
            font-size: 0.95rem;
            margin-bottom: 20px;
        }

        .highlight-time {
            color: var(--primary);
            font-weight: 600;
        }

        /* 篩選區 */
        .filter-panel {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            background: rgba(30, 41, 59, 0.3);
            backdrop-filter: blur(8px);
            border-radius: 20px;
            border: 1px solid var(--border-color);
            padding: 20px;
            margin-bottom: 30px;
            align-items: center;
        }

        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex: 1;
            min-width: 200px;
        }

        .filter-group label {
            font-size: 0.85rem;
            color: var(--text-muted);
            font-weight: 600;
            text-transform: uppercase;
        }

        .filter-group select, .filter-group input {
            padding: 10px 15px;
            background: #1e293b;
            border: 1px solid var(--border-color);
            border-radius: 10px;
            color: var(--text-color);
            font-size: 0.95rem;
            outline: none;
            transition: all 0.3s ease;
        }

        .filter-group select:focus, .filter-group input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--primary-glow);
        }

        /* 物件列表 */
        .listing-stats {
            margin-bottom: 20px;
            font-size: 1.1rem;
            color: var(--text-muted);
        }

        .stats-count {
            color: var(--primary);
            font-weight: 700;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 25px;
        }

        .card {
            background: var(--card-bg);
            backdrop-filter: blur(12px);
            border-radius: 20px;
            border: 1px solid var(--border-color);
            overflow: hidden;
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease;
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px var(--primary-glow);
            border-color: rgba(249, 115, 22, 0.4);
        }

        .card-img-container {
            width: 100%;
            height: 200px;
            position: relative;
            background: #1e293b;
            overflow: hidden;
        }

        .card-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s ease;
        }

        .card:hover .card-img {
            transform: scale(1.08);
        }

        .badge-district {
            position: absolute;
            top: 15px;
            left: 15px;
            background: var(--primary);
            color: #fff;
            padding: 4px 12px;
            border-radius: 30px;
            font-size: 0.8rem;
            font-weight: 700;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }

        .badge-kind {
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(4px);
            color: #fff;
            padding: 4px 12px;
            border-radius: 30px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .card-body {
            padding: 20px;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }

        .card-price {
            font-size: 1.6rem;
            font-weight: 800;
            color: #ff6b00;
            margin-bottom: 8px;
            display: flex;
            align-items: baseline;
            gap: 4px;
        }

        .card-price span {
            font-size: 0.85rem;
            color: var(--text-muted);
            font-weight: 400;
        }

        .card-price-include {
            font-size: 0.8rem;
            color: var(--success);
            background: rgba(16, 185, 129, 0.1);
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 600;
            align-self: center;
            margin-left: 10px;
        }

        .card-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #fff;
            margin-bottom: 12px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            height: 2.8rem;
        }

        .card-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
            font-size: 0.85rem;
            color: var(--text-muted);
            border-top: 1px solid var(--border-color);
            padding-top: 12px;
        }

        .detail-item {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .card-address {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-bottom: 15px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .card-footer {
            margin-top: auto;
            display: flex;
            gap: 10px;
        }

        .btn {
            flex: 1;
            padding: 10px;
            text-align: center;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }

        .btn-primary {
            background: var(--primary);
            color: #fff;
            box-shadow: 0 4px 14px rgba(249, 115, 22, 0.3);
        }

        .btn-primary:hover {
            background: #ea580c;
            box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
        }

        .btn-outline {
            border: 1px solid var(--border-color);
            color: var(--text-muted);
            background: rgba(255, 255, 255, 0.02);
        }

        .btn-outline:hover {
            color: #fff;
            border-color: var(--text-muted);
            background: rgba(255, 255, 255, 0.06);
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>591 租屋網特搜 🚀 松山/大安/中正優質套房</h1>
            <p class="meta-info">資料更新時間：<span class="highlight-time" id="fetched-time">取得中...</span></p>
        </header>

        <div id="cache-warning" style="display: none; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; padding: 15px; border-radius: 12px; margin-bottom: 25px; text-align: center; font-size: 0.95rem; line-height: 1.5; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);">
            ⚠️ Cloudflare/AWS 阻擋了 GitHub Actions 雲端自動更新，目前顯示為歷史快取資料。<br>
            如需強制獲取即時資料，請在本地執行 <code>update_591.command</code> 腳本。
        </div>

        <section class="filter-panel">
            <div class="filter-group">
                <label for="filter-district">行政區</label>
                <select id="filter-district">
                    <option value="all">全部地區</option>
                    <option value="大安區">大安區</option>
                    <option value="松山區">松山區</option>
                    <option value="中正區">中正區</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="filter-kind">套房類型</label>
                <select id="filter-kind">
                    <option value="all">全部類型</option>
                    <option value="獨立套房">獨立套房</option>
                    <option value="分租套房">分租套房</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="search-input">關鍵字搜尋 (標題/地址)</label>
                <input type="text" id="search-input" placeholder="例如: 捷運、南京、復興...">
            </div>
            <div class="filter-group">
                <label for="sort-select">租金排序</label>
                <select id="sort-select">
                    <option value="low-high">租金：由低到高</option>
                    <option value="high-low">租金：由高到低</option>
                </select>
            </div>
        </section>

        <div class="listing-stats">
            共找到 <span class="stats-count" id="total-count">0</span> 間合適房屋
        </div>

        <main class="grid" id="listings-grid">
            <!-- 房屋卡片動態渲染 -->
        </main>
    </div>

    <script>
        let allRentals = [];
        let debugLogs = [];

        // 載入資料 (改為相對路徑讀取 data.json)
        fetch('./data.json')
            .then(res => res.json())
            .then(data => {
                document.getElementById('fetched-time').textContent = data.fetched_time;
                allRentals = data.rentals || [];
                debugLogs = data.debug_logs || [];
                
                // 檢查是否為快取資料，是的話顯示警告橫幅
                const warningBanner = document.getElementById('cache-warning');
                if (data.is_cached) {
                    warningBanner.style.display = 'block';
                } else {
                    warningBanner.style.display = 'none';
                }
                
                applyFilters();
            })
            .catch(err => {
                console.error("載入 JSON 失敗", err);
                document.getElementById('fetched-time').textContent = "載入失敗";
            });

        // 篩選與排序邏輯
        const districtSelect = document.getElementById('filter-district');
        const kindSelect = document.getElementById('filter-kind');
        const searchInput = document.getElementById('search-input');
        const sortSelect = document.getElementById('sort-select');

        [districtSelect, kindSelect, sortSelect].forEach(el => {
            el.addEventListener('change', applyFilters);
        });
        searchInput.addEventListener('input', applyFilters);

        function applyFilters() {
            let filtered = [...allRentals];

            // 1. 行政區篩選
            const district = districtSelect.value;
            if (district !== 'all') {
                filtered = filtered.filter(item => item.district === district);
            }

            // 2. 類型篩選
            const kind = kindSelect.value;
            if (kind !== 'all') {
                filtered = filtered.filter(item => item.kind === kind);
            }

            // 3. 關鍵字搜尋
            const query = searchInput.value.trim().toLowerCase();
            if (query) {
                filtered = filtered.filter(item => 
                    item.title.toLowerCase().includes(query) || 
                    item.address.toLowerCase().includes(query)
                );
            }

            // 4. 排序
            const sort = sortSelect.value;
            filtered.sort((a, b) => {
                const priceA = parseInt(a.price.replace(/[^0-9]/g, '')) || 0;
                const priceB = parseInt(b.price.replace(/[^0-9]/g, '')) || 0;
                return sort === 'low-high' ? priceA - priceB : priceB - priceA;
            });

            renderGrid(filtered);
        }

        function renderGrid(items) {
            const grid = document.getElementById('listings-grid');
            document.getElementById('total-count').textContent = items.length;
            
            if (items.length === 0) {
                let debugHtml = '';
                if (debugLogs && debugLogs.length > 0) {
                    debugHtml = `<div style="margin-top: 30px; text-align: left; background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid rgba(248, 113, 113, 0.2); font-family: monospace; font-size: 0.85rem; color: #f87171; max-width: 800px; margin-left: auto; margin-right: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                        <h4 style="margin-bottom: 12px; font-size: 1rem; color: #fca5a5; display: flex; align-items: center; gap: 8px;">
                            ⚠️ GitHub Actions 執行偵錯日誌 (Debug Logs):
                        </h4>
                        <div style="max-height: 250px; overflow-y: auto; padding: 10px; background: #0f172a; border-radius: 6px; line-height: 1.5;">
                            ${debugLogs.map(log => `<div style="margin-bottom: 4px; white-space: pre-wrap; word-break: break-all;">${log}</div>`).join('')}
                        </div>
                    </div>`;
                }
                grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--text-muted);">
                    無符合條件的套房資料。
                    ${debugHtml}
                </div>`;
                return;
            }

            grid.innerHTML = items.map(item => {
                const includeBadge = item.price_contain && item.price_contain !== '無' 
                    ? `<span class="card-price-include">含 ${item.price_contain}</span>` 
                    : '';
                    
                return `
                    <article class="card">
                        <div class="card-img-container">
                            <span class="badge-district">${item.district}</span>
                            <span class="badge-kind">${item.kind}</span>
                            <img class="card-img" src="${item.cover_img}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80'">
                        </div>
                        <div class="card-body">
                            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                <div class="card-price">${item.price}</div>
                                ${includeBadge}
                            </div>
                            <h2 class="card-title" title="${item.title}">${item.title}</h2>
                            <div class="card-address" title="${item.address}">📍 ${item.address || '地段詳見連結'}</div>
                            
                            <div class="card-details">
                                <div class="detail-item">📏 ${item.size_floor}</div>
                                <div class="detail-item">👀 ${item.yesterday_views}</div>
                            </div>
                            
                            <div class="card-footer">
                                <a href="${item.url}" target="_blank" class="btn btn-primary">看 591 詳情</a>
                            </div>
                        </div>
                    </article>
                `;
            }).join('');
        }
    </script>
</body>
</html>
"""
    
    html_path = os.path.join(PUBLIC_DIR, 'index.html')
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"成功生成 {html_path}")

if __name__ == '__main__':
    main()
