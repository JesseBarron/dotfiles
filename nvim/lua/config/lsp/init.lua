vim.o.completeopt = 'menu,menuone,noinsert'

-- LSP Config
vim.pack.add({
  'https://github.com/neovim/nvim-lspconfig'
})

-- Basic LSP setup will go here
local lspconfig = require('lspconfig')


require('config.lsp.gopls')



-- Autocomplete on demand
vim.keymap.set('i', '<A-space>', function()
  vim.lsp.completion.get({})
end, {desc = 'Display LSP Autocomplete menu'})

-- Go To Definition
vim.keymap.set('n', 'gd', '<c-]>', {desc = ''}) 
