#!/bin/bash

# attempt to install nvim
bash "./neovim_install.sh"

echo"Installing Lvim"
LV_BRANCH='release-1.4/neovim-0.9' bash <(curl -s https://raw.githubusercontent.com/LunarVim/LunarVim/release-1.4/neovim-0.9/utils/installer/install.sh)
