vim.pack.add({
  'https://github.com/lewis6991/gitsigns.nvim'
})

local gitsigns = require('gitsigns')

-- Go to next Git Hunk
vim.keymap.set("n", "]h", function() gitsigns.nav_hunk("next") end, {desc="Navigate to next git hunk"})
-- Go to previous Git Hunk
vim.keymap.set("n", "[h", function() gitsigns.nav_hunk("prev") end, {desc="Navigate to previous git hunk"})

-- Git Blame Line
vim.keymap.set("n", "<leader>gb", function() gitsigns.blame_line() end, {desc="Open git blame for current line"})

-- Git Blame 
vim.keymap.set("n", "<leader>gf", function() gitsigns.blame() end, {desc="Open git blame for current file"})

-- Reset Hunk
vim.keymap.set("n", "<leader>ghr", function() gitsigns.reset_hunk() end, {desc="Reset git hunk"})
vim.keymap.set("v", "<leader>ghr", function() gitsigns.reset_hunk({vim.fn.line('.'), vim.fn.line('v')}) end, {desc="Reset git hunk in range"})
