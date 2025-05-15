return {
  { "mason-org/mason.nvim", version = "^1.0.0" },
  { "mason-org/mason-lspconfig.nvim", version = "^1.0.0" },
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
