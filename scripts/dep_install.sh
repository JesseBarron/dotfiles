#!/bin/bash

sudo apt-get update -qq update && sudo apt-get -qq --yes --force-yes install fzf

# attempt to install nvim
echo "Installing Neovim"
curl -LO https://github.com/neovim/neovim/releases/latest/download/nvim-linux-x86_64.appimage
chmod u+x nvim-linux-x86_64.appimage
./nvim-linux-x86_64.appimage

./nvim-linux-x86_64.appimage --appimage-extract

./nvim-linux-x86_64.appimage --appimage-extract
./squashfs-root/AppRun --version

# Optional: exposing nvim globally.
sudo mv squashfs-root /
sudo ln -s /squashfs-root/AppRun /usr/bin/nvim
echo "Finished installing Neovim"
