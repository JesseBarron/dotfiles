#!/bin/bash

echo "Installing Lazygit"
# Remember I need to install go
git clone https://github.com/jesseduffield/lazygit.git
cd lazygit
go install

echo "Finished installing Lazygit"
