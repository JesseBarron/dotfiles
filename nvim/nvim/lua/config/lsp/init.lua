vim.o.completeopt = 'menu,menuone,noinsert'

-- LSP Config
vim.pack.add({
  'https://github.com/neovim/nvim-lspconfig'
})

-- Basic LSP setup will go here
local lspconfig = require('lspconfig')

-- Configure padding/border choices
local float_opts = {
  border = 'single', -- Adds margin space. Options: "single", "double", "rounded", "solid"
  max_width = 80,
  max_height = 20,
}

-- Hover documentation padding
vim.keymap.set('n', 'K', function()
  vim.lsp.buf.hover(float_opts)
end, { desc = "LSP Hover Documentation" })

-- Signature help padding
vim.keymap.set('i', '<C-k>', function()
  vim.lsp.buf.signature_help(float_opts)
end, { desc = "LSP Signature Help" })

require('config.lsp.gopls')
require('config.lsp.python')
require('config.lsp.dart')
require('config.lsp.c')

-- Autocomplete on demand
vim.keymap.set('i', '<A-space>', function()
  vim.lsp.completion.get({})
end, {desc = 'Display LSP Autocomplete menu'})

-- Go To Definition
vim.keymap.set('n', 'gd', '<c-]>', {desc = ''}) 
