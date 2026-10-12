vim.pack.add({
  'https://github.com/m4xshen/autoclose.nvim'
})

require('autoclose').setup({
  options = {
    disabled_filetypes = {'markdown', 'text'}
  }
})
