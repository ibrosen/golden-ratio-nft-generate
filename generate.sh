!#/bin/bash
yarn setup clear $1 100000 10000
yarn generate --metadata $i 100000 10000
pm2 start yarn --no-autorestart --name generate -- generate -- --images $1 100000 10000