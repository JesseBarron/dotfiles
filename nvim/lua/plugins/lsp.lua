return {
  {
    "neovim/nvim-lspconfig",
    opts = function()
      vim.schedule(function()
        vim.cmd("LspStart")
      end)
    end,
  },
  {
    "williamboman/mason.nvim",
    cmd = "Mason",
    opts = {
      ensure_installed = {
        "stylua",
        "shfmt",
        "phpstan",
        "php-debug-adapter",
        "intelephense",
        "angular-language-server",
        "lua-language-server",
        "prettier",
        "prettierd",
        "shfmt",
        "stylua",
        "typescript-language-server",
      },
    },
  },
}
