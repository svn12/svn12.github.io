import requests
from bs4 import BeautifulSoup
import re
import subprocess
import json
import os
import time
import pandas as pd

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
}

def get_nuxt_data(url):
    print(f"正在抓取網頁: {url}")
    try:
        res = requests.get(url, headers=headers, timeout=15)
        if res.status_code != 200:
            print(f"  請求失敗，狀態碼: {res.status_code}")
            return None
            
        soup = BeautifulSoup(res.text, 'html.parser')
        scripts = soup.find_all('script')
        
        nuxt_js = None
        for s in scripts:
            if s.string and '__NUXT__' in s.string:
                nuxt_js = s.string
                break
                
        if not nuxt_js:
            print("  在 HTML 中找不到 __NUXT__ 變數")
            return None
            
        js_content = f"const window = {{}};\n{nuxt_js}\nconsole.log(JSON.stringify(window.__NUXT__));"
        
        js_path = 'temp_nuxt_v3.js'
        with open(js_path, 'w', encoding='utf-8') as f:
            f.write(js_content)
            
        proc = subprocess.run(['node', js_path], capture_output=True, text=True, encoding='utf-8', timeout=10)
        if proc.returncode != 0:
            print(f"  Node 執行出錯: {proc.stderr}")
            return None
            
        return json.loads(proc.stdout)
    except Exception as e:
        print(f"  處理網址 {url} 時發生錯誤: {e}")
        return None
    finally:
        if 'js_path' in locals() and os.path.exists(js_path):
            os.remove(js_path)

def extract_listings(data):
    if not data:
        return []
    
    listings = []
    try:
        rent_list = data.get('pinia', {}).get('rent-list', {})
        normal_list = rent_list.get('dataList', [])
        top_list = rent_list.get('topDataList', [])
        
        for item in normal_list + top_list:
            if not isinstance(item, dict):
                continue
            listings.append(item)
    except Exception as e:
        print(f"  解析 listings 時出錯: {e}")
        
    return listings

def main():
    all_raw_listings = []
    
    # 抓取種類 2 (獨立套房) 與 3 (分租套房)
    for kind in [2, 3]:
        page = 1
        while True:
            url = f'https://rent.591.com.tw/?region=1&section=1,4,5&kind={kind}&rentprice=10000_20000&page={page}'
            data = get_nuxt_data(url)
            listings = extract_listings(data)
            
            if not listings:
                print(f"  [Kind {kind}] Page {page} 沒有撈到資料，停止此種類抓取")
                break
                
            all_raw_listings.extend(listings)
            print(f"  [Kind {kind}] Page {page} 撈到 {len(listings)} 筆資料")
            
            try:
                normal_len = len(data.get('pinia', {}).get('rent-list', {}).get('dataList', []))
            except:
                normal_len = 0
                
            if normal_len < 30:
                print(f"  [Kind {kind}] Page {page} 的一般物件數量為 {normal_len} < 30，判定為最後一頁，停止抓取。")
                break
                
            page += 1
            time.sleep(1.5)
            
            if page > 4:
                print("  已達到最大抓取頁數限制 (4頁)")
                break

    # 統一進行去重與區域、價格過濾
    unique_listings = {}
    for item in all_raw_listings:
        house_id = item.get('id')
        if not house_id:
            continue
            
        sec_id = item.get('sectionid')
        if sec_id not in [1, 4, 5]:
            continue
            
        price_str = str(item.get('price', '')).replace(',', '')
        if price_str.isdigit():
            price_val = int(price_str)
            if price_val < 10000 or price_val > 20000:
                continue
        else:
            continue
            
        unique_listings[house_id] = item
        
    print(f"\n全部合併、去重並篩選後，共取得 {len(unique_listings)} 筆符合松山/大安/中正 1萬~2萬的套房資料。")
    
    # 整理輸出欄位
    output_data = []
    for item in unique_listings.values():
        title = item.get('title', '').strip()
        kind_name = item.get('kind_name', '套房')
        price = f"{item.get('price', '')} 元"
        
        contain_text = item.get('price_contain_text', '')
        if contain_text:
            contain_clean = contain_text.replace('(', '').replace(')', '').replace('租金含', '').strip()
        else:
            contain_clean = "無"
            
        area = item.get('area')
        if not area and item.get('area_name'):
            area = item.get('area_name')
        if area:
            area_str = str(area).replace('坪', '').strip()
            area = f"{area_str}坪"
        else:
            area = "暫無資料"
            
        floor = item.get('floor_name') or item.get('floor_str') or ''
        size_floor = f"{area} {floor}".strip()
        sec_name = "中正區" if item.get('sectionid') == 1 else ("松山區" if item.get('sectionid') == 4 else "大安區")
        url = item.get('url', '')
        if not url and item.get('id'):
            url = f"https://rent.591.com.tw/{item.get('id')}"
            
        # 欄位 1: 地址
        address = item.get('address', '')
        
        # 欄位 2: 何時更新
        refresh_time = item.get('refresh_time', '')
        
        # 欄位 3: 昨日瀏覽人數
        browse_count = item.get('browse_count', 0)
        yesterday_views = f"昨日 {browse_count} 人瀏覽" if browse_count else "暫無資料"
        
        # 欄位 4: 封面照片網址 (改為 !510x400.jpg 格式)
        photo_list = item.get('photoList', [])
        cover_img = ""
        if photo_list and isinstance(photo_list, list) and len(photo_list) > 0:
            cover_img = photo_list[0]
        else:
            cover_img = item.get('cover', '')
            
        if cover_img:
            base_url = cover_img.split('!')[0]
            cover_img = base_url + '!510x400.jpg'
        else:
            cover_img = "無圖片"
            
        output_data.append({
            'district': sec_name,
            'title': title,
            'kind': kind_name,
            'price': price,
            'price_contain': contain_clean,
            'size_floor': size_floor,
            'address': address,
            'refresh_time': refresh_time,
            'yesterday_views': yesterday_views,
            'cover_img': cover_img,
            'url': url
        })
        
    # 分類：大安區、松山區與中正區
    daan_list = [x for x in output_data if x['district'] == '大安區']
    songshan_list = [x for x in output_data if x['district'] == '松山區']
    zhongzheng_list = [x for x in output_data if x['district'] == '中正區']
    
    # 按照租金排序 (小到大)
    def get_price_num(x):
        try:
            return int(x['price'].replace(' 元', '').replace(',', ''))
        except:
            return 99999
            
    daan_list.sort(key=get_price_num)
    songshan_list.sort(key=get_price_num)
    zhongzheng_list.sort(key=get_price_num)
    
    # 輸出 Excel (使用相對路徑)
    output_dir = 'output'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    excel_path = os.path.join(output_dir, '591_rent_list.xlsx')
    
    # 建立 DataFrame 並存入 Excel
    df_excel = pd.DataFrame(daan_list + songshan_list + zhongzheng_list)
    df_excel.rename(columns={
        'district': '行政區',
        'title': '名稱',
        'kind': '類型',
        'price': '租金',
        'price_contain': '租金包含',
        'size_floor': '大小 / 樓層',
        'address': '地址',
        'refresh_time': '何時更新',
        'yesterday_views': '昨日瀏覽人數',
        'cover_img': '封面照片網址',
        'url': '連結'
    }, inplace=True)
    
    df_excel.to_excel(excel_path, index=False, sheet_name='591租屋列表')
    print(f"Excel 檔案成功生成: {excel_path}")
    
    # 輸出 Markdown
    md_file = os.path.join(output_dir, '591_rent_list.md')
    md_content = []
    md_content.append("# 591 租屋網松山/大安/中正區套房列表 (1萬~2萬)\n")
    md_content.append(f"篩選條件：**松山區/大安區/中正區**、**獨立套房/分租套房**、**租金 10,000 ~ 20,000 元**。\n")
    md_content.append(f"共取得 {len(output_data)} 筆有效套房資料 (大安區 {len(daan_list)} 筆，松山區 {len(songshan_list)} 筆，中正區 {len(zhongzheng_list)} 筆)。\n")
    
    def generate_table(items):
        table = []
        table.append("| 名稱 | 類型 | 租金 | 租金包含 | 大小/樓層 | 地址 | 更新時間 | 昨日瀏覽 | 圖片與連結 |")
        table.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |")
        for item in items:
            title = item['title'].replace('|', '\\|')
            kind = item['kind']
            price = item['price']
            price_contain = item['price_contain']
            size_floor = item['size_floor']
            address = item['address']
            refresh = item['refresh_time']
            views = item['yesterday_views']
            url = item['url']
            cover = item['cover_img']
            
            table.append(f"| [{title}]({url}) | {kind} | {price} | {price_contain} | {size_floor} | {address} | {refresh} | {views} | [連結]({url}) / [圖片]({cover}) |")
        return "\n".join(table)
        
    md_content.append("## 大安區 套房列表")
    if daan_list:
        md_content.append(generate_table(daan_list))
    else:
        md_content.append("無符合大安區之資料")
        
    md_content.append("\n## 松山區 套房列表")
    if songshan_list:
        md_content.append(generate_table(songshan_list))
    else:
        md_content.append("無符合松山區之資料")
        
    md_content.append("\n## 中正區 套房列表")
    if zhongzheng_list:
        md_content.append(generate_table(zhongzheng_list))
    else:
        md_content.append("無符合中正區之資料")
        
    with open(md_file, 'w', encoding='utf-8') as f:
        f.write("\n".join(md_content))
        
    print(f"Markdown 報告成功生成: {md_file}")

if __name__ == '__main__':
    main()
