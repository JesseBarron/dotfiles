vim.lsp.enable('gopls')
vim.lsp.enable('templ')

vim.lsp.config('gopls', {
  on_attach = function (client, bufnr)
    vim.lsp.completion.enable(true, client.id, bufnr)
  end
})
