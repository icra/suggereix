
#!/bin/bash

#git: commit and push
git add *
git commit
git push

#deploy github repo to dev server

#loading server
command='cd /var/www/vhosts/icradev.cat/suggereix.icradev.cat/; git pull'
ssh root@217.61.208.188 "$command"
