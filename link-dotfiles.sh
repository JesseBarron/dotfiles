#!/bin/bash

DEST=~/.config

cp -rf $(pwd)/alacritty $DEST
cp -rf $(pwd)/nvim $DEST
cp -rf $(pwd)/tmux $DEST
cp -rf $(pwd)/ssh.sh ~/
cp -rf $(pwd)/ssh/config ~/.ssh/config
