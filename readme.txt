https://pages.github.com/
cd C:\Users\TAI\Documents\Html5\金魚都能懂網頁設計入門\svn12.github.io
$git clone https://github.com/svn12/svn12.github.io
git add --all
git commit -m "Initial commit"
git push -u origin master
svn12 sv4348jk
svn12.github.io


第一个是你的 工作目录，它持有实际文件；
第二个是 暂存区（Index），它像个缓存区域，临时保存你的改动；
最后是 HEAD，它指向你最后一次提交的结果。
动提交到远端仓库



Step 1
git add <filename>
git add *
Step2
git commit -m "代码提交信息"
Step 3
git push origin master