rem git config --global --unset user.name
rem git config --global --unset user.email
Rem �i�J�M�׸�Ƨ��A��W�]�w�C��repo �ϥΪ̦W��/�l�c
rem git config user.email "svn12@gmail.com"
rem git config user.name "svn12"
git pull
git add -A .
git commit -m %1
git push origin master

