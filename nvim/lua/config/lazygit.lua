local Terminal = require('toggleterm.terminal').Terminal

local lazygit = Terminal:new({
  cmd = 'lazygit',
  direction = 'float',
  hidden = true,
  on_open = function(term)
    vim.cmd('startinsert!')
    vim.keymap.set('n', 'q', '<cmd>close<cr>', { buffer = term.bufnr, silent = true })
  end,
})

vim.keymap.set('n', '<leader>gg', function() lazygit:toggle() end, { desc = 'Open lazygit in a floating window' })
