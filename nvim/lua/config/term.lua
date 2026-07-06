vim.pack.add({
  'https://github.com/akinsho/toggleterm.nvim'
})

require('toggleterm').setup()

-- Toggle term with ctl-/
vim.keymap.set("n", "<c-/>", "<cmd>ToggleTerm size=15 direction=horizontal name=term <cr>")
-- Press escape to return to normal mode in the terminal
vim.keymap.set('t', '<esc>', [[<C-\><C-n>]])
vim.keymap.set('t', "<c-/>", "<cmd>ToggleTerm<cr>")
