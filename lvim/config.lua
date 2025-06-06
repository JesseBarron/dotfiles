-- Read the docs: https://www.lunarvim.org/docs/configuration
-- Video Tutorials: https://www.youtube.com/watch?v=sFA9kX-Ud_c&list=PLhoH5vyxr6QqGu0i7tt_XoVK9v-KvZ3m6
-- Forum: https://www.reddit.com/r/lunarvim/
-- Discord: https://discord.com/invite/Xb9B4Ny

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

require 'user.plugins'
-- require 'user.keymappings'
-- require 'user.globals'
-- require 'neorg.auto-push'

-- Other options
vim.opt.shiftwidth = 2        -- the number of spaces inserted for each indentation
vim.opt.tabstop = 2           -- insert 2 spaces for a tab
vim.opt.relativenumber = true -- relative line numbers
vim.opt.cc = "120"              -- set right margin at col 120
vim.opt.spell = true

vim.o.termguicolors = true

vim.keymap.set('n', 'K', vim.lsp.buf.hover, {})
