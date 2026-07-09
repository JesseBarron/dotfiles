vim.o.number = true
vim.o.rnu = true
vim.o.wrap = false

vim.opt.clipboard = 'unnamedplus'

vim.o.expandtab = true -- expand tab input with spaces characters
vim.o.smartindent = true -- syntax aware indentations for newline inserts
vim.o.tabstop = 2 -- num of space characters per tab
vim.o.shiftwidth = 2 -- spaces per indentation level

vim.o.ignorecase = true -- spaces per indentation level
				
vim.g.mapleader = ' '


-- Highlight when yanking
vim.api.nvim_create_autocmd('TextYankPost', {
 callback = function ()
   vim.hl.on_yank()
 end
})

-- File manager
vim.pack.add({
    'https://github.com/stevearc/oil.nvim',
})
require('oil').setup()
vim.keymap.set('n', '-', '<CMD>Oil<CR>', { desc = 'Open parent directory' })

-- Planery
vim.pack.add({
  'https://github.com/nvim-lua/plenary.nvim'
})

vim.pack.add({
  'https://github.com/nvim-tree/nvim-web-devicons',
  'https://github.com/nvim-lualine/lualine.nvim'
})

require('lualine').setup()

-- Keymaps
require('config.keymaps')

-- Telescope
require('config.telescope')

-- LSP Configuration
require('config.lsp')

-- LSP Configuration
require('config.treesitter')

require('config.colorschemes')

require('config.gitsigns')

require('config.autoclose')

require('config.term')

require('config.lazygit')

require('config.octo')

