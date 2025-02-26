#!/bin/bash

# echo "Installing Lua"
# curl -L -R -O https://www.lua.org/ftp/lua-5.4.7.tar.gz
# tar zxf lua-5.4.7.tar.gz
# cd lua-5.4.7
# make all test
# mv /src/lua /
# sudo ln -s /lua /usr/bin/lua
# echo "Finished installing Lua"

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
nvim

# Optional: exposing nvim globally.
# sudo mv squashfs-root /
# sudo ln -s /squashfs-root/AppRun /usr/bin/nvim
# nvim
# curl -LO https://github.com/neovim/neovim/releases/latest/download/nvim.appimage
# chmod u+x nvim.appimage
# ./nvim.appimage
#
# ./nvim.appimage --appimage-extract

#exposing nvim globally.
# sudo mv squashfs-root /
# sudo ln -s /squashfs-root/AppRun /usr/bin/nvim
# bash "Finished installing Neovim"

# echo "Installing Lvim"
# LV_BRANCH='release-1.4/neovim-0.9' curl -s https://raw.githubusercontent.com/LunarVim/LunarVim/release-1.4/neovim-0.9/utils/installer/install.sh | bash -s -- --no-install-dependencies
# echo "Finished installing Lvim"
