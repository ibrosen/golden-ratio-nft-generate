git clone https://github.com/ibrosen/golden-ratio-nft-generate.git
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
source ~/.bashrc
nvm install 16
nvm use 16
cd golden-ratio-nft-generate
npm install -g pm2 
npm install -g yarn
yarn set version classic
yarn
yarn setup -- layersAndClear 100000 200000 10000
pm2 start --no-autorestart --interpreter bash yarn -- generate -- --images 0 500000 10000