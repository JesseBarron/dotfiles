#!/bin/bash

curl -LO https://github.com/neovim/neovim/releases/latest/download/nvim.appimage
chmod u+x nvim.appimage
./nvim.appimage

mkdir -p /opt/nvim
mv nvim.appimage /opt/nvim/nvim
