#!/bin/bash

TMPDIR=$(mktemp -d)

CURRENT=$PWD

cd $TMPDIR

for script in ~/.dotfiles/scripts/*; do
  echo"Running... $script\n"
  bash "$script"
  echo"Finished...\n"
done

cd $CURRENT

rm -rf $TMPDIR
