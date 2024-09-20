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
    opts_extend = { "ensure_installed" },
    opts = {
      ensure_installed = {
        "stylua",
        "shfmt",
        "phpstan",
        "php-debug-adapter",
        "phpactor",
        "angular-language-server",
        "lua-language-server",
        "pint",
        "prettier",
        "prettierd",
        "shfmt",
        "stylua",
        "typescript-language-server",
      },
    },
  },
}
