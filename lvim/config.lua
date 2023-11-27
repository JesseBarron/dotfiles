-- Read the docs: https://www.lunarvim.org/docs/configuration
-- Video Tutorials: https://www.youtube.com/watch?v=sFA9kX-Ud_c&list=PLhoH5vyxr6QqGu0i7tt_XoVK9v-KvZ3m6
-- Forum: https://www.reddit.com/r/lunarvim/
-- Discord: https://discord.com/invite/Xb9B4Ny

vim.opt.shiftwidth = 2        -- the number of spaces inserted for each indentation
vim.opt.tabstop = 2           -- insert 2 spaces for a tab
vim.opt.relativenumber = true -- relative line numbers

vim.o.termguicolors = true
lvim.colorscheme = "catppuccin-mocha"

local dap = require 'dap'
dap.adapters.php = {
  type = 'executable',
  command = 'node',
  args = { '/home/jesse/vscode-php-debug/out/phpDebug.js' }
}

dap.configurations.php = {
  {
    type = 'php',
    request = 'launch',
    name = 'Listen for Xdebug',
    port = 9003,
    log = false,
    -- serverSourceRoot = '/var/www/',
    -- localSourceRoot = '/home/jesse/questions/backend/app-api',
    -- localSourceRoot = vim.fn.expand("%:p:h").."/"
    pathMappings = {
      ["/var/www"] = "/home/jesse/questions/backend/app-api"
    }
  }
}

-- Plugins
lvim.plugins = {
  {
    'mbbill/undotree',
    config = function()
      vim.keymap.set('n', '<leader>u', vim.cmd.UndotreeToggle)
    end
  },
  { 'sindrets/diffview.nvim' },
  { "nvim-telescope/telescope-dap.nvim" },
  { "catppuccin/nvim" },
  { 'christoomey/vim-tmux-navigator' },
  {
    "iamcco/markdown-preview.nvim",
    cmd = { "MarkdownPreviewToggle", "MarkdownPreview", "MarkdownPreviewStop" },
    build = "cd app && yarn install",
    init = function()
      vim.g.mkdp_filetypes = { "markdown" }
    end,
    ft = { "markdown" },
  }, { 'phaazon/hop.nvim' },
  { 'nvim-lua/plenary.nvim' },
  {
    'JesseBarron/docker-buddy.nvim',
    config = function() require 'docker-buddy' end
  },
  {
    "nvim-neorg/neorg",
    build = ":Neorg sync-parsers",
    dependencies = { "nvim-lua/plenary.nvim" },
    config = function()
      require("neorg").setup {
        load = {
          -- ["core.completion"] = {},
          ["core.summary"] = {},
          ["core.defaults"] = {}, -- Loads default behaviour
          ["core.concealer"] = {}, -- Adds pretty icons to your documents
          ["core.dirman"] = { -- Manages Neorg workspaces
            config = {
              workspaces = {
                work = '~/notes/work',
                personal = "~/notes/personal",
                study = "~/notes/study",
              },
            },
          },
        },
      }
    end,
  },
}

require 'user.keymappings'
require 'user.globals'
require 'user.plugins'
require 'workspace'

