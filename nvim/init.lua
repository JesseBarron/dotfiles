-- Options --
vim.opt.number = true
-- enable mouse on all modes
vim.opt.mouse = 'a'
-- ignorecase when searching
vim.opt.ignorecase = true
vim.opt.smartcase = true

vim.opt.hlsearch = false
vim.opt.incsearch = true

-- Enable Wrap
vim.opt.wrap = false
vim.opt.breakindent = true

-- Tab spacing
vim.opt.tabstop = 2
vim.opt.shiftwidth = 2

vim.opt.scrolloff = 8
vim.opt.updatetime = 50

vim.opt.colorcolumn = "80"

-- Theme
vim.opt.termguicolors = true

function DarkMode(color)
	color = color or 'melange'
	vim.opt.background = 'dark'
	vim.cmd.colorscheme(color)
end

function LightMode()
	color = color or 'melange'
	vim.opt.background = 'light'
	vim.cmd.colorscheme(color)
end

DarkMode()

require('jesse')
require('plugins')
