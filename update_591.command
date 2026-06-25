#!/bin/bash
# 設定工作目錄為此腳本所在的資料夾
cd "$(dirname "$0")"

echo "=================================================="
echo "      591 租屋網本地更新工具 🚀"
echo "=================================================="
echo ""
echo "正在抓取最新套房資料（使用本地台灣 IP，可避開 Cloudflare 封鎖）..."
echo ""

# 執行爬蟲
python3 scripts/get_all_591_v3.py

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ 抓取失敗！請確認網路是否正常，或 Python 是否安裝了必要的套件。"
  echo "提示: 可以執行 'pip install pandas openpyxl requests beautifulsoup4'"
  echo ""
  read -p "請按任意鍵結束..." -n1 -s
  exit 1
fi

echo ""
echo "正在產生網頁檔案..."
python3 scripts/generate_web_files.py

echo ""
echo "正在拷貝檔案到發布目錄..."
mkdir -p Gemini/591_rent_list
cp public/data.json Gemini/591_rent_list/data.json
cp public/index.html Gemini/591_rent_list/index.html

echo ""
echo "正在同步並發布到 GitHub Pages..."
git add Gemini/591_rent_list/ scripts/
git commit -m "auto: local forced update 591 rental data"
git pull --rebase
git push

echo ""
echo "=================================================="
echo "  🎉 更新完成！ 網頁將在 1 分鐘內在 GitHub 更新。"
echo "=================================================="
echo ""
sleep 3
