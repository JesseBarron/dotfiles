#!/bin/bash

echo "linking config files"
bash ~/.dotfiles/link-dotfiles.sh
echo "finished linking config files"

TMPDIR=$(mktemp -d)

CURRENT=$PWD

cd $TMPDIR

echo "Running install scripts"
for script in ~/.dotfiles/scripts/*; do
  bash "$script"
done
echo "Finished install scripts"

cd $CURRENT

rm -rf $TMPDIR
