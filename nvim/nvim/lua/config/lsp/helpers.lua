function attachAutocompleteListener(lspName) 
  vim.lsp.config(lspName, {
    on_attach = function (client, bufnr)
      vim.lsp.completion.enable(true, client.id, bufnr)
    end
  })
end
