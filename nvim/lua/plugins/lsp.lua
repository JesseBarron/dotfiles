return {
  {
    "neovim/nvim-lspconfig",
    opts = function()
      vim.schedule(function()
        vim.cmd("LspStart")
      end)
    end,
  },
}
