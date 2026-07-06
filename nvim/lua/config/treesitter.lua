-- Treesitter
vim.pack.add({
  'https://github.com/nvim-treesitter/nvim-treesitter'
})

local treesitter = require('nvim-treesitter')
treesitter.setup()
treesitter.install({ 'templ', 'go', 'lua' })

vim.api.nvim_create_autocmd('FileType', {
  pattern = { 'go', 'templ', 'lua' },
  callback = function() vim.treesitter.start() end,
})

