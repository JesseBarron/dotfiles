require('config.lsp.helpers')
vim.lsp.enable('gopls')
vim.lsp.enable('templ')

attachAutocompleteListener('gopls')
