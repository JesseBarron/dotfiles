#!/bin/bash

DEST=~/.config

ln -sf $(pwd)/alacritty $DEST

# Delete default lvim config
LVIM_CONFIG_DIR="$DEST/lvim"
if test -d $LVIM_CONFIG_DIR; then
  echo "Deleting default lvim config"
  rm -rf $LVIM_CONFIG_DIR
fi

# ln -sf $(pwd)/lvim $DEST
ln -sf $(pwd)/nvim $DEST
ln -sf $(pwd)/tmux $DEST
