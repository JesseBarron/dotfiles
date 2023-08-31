-- Leader
vim.g.mapleader = " "

-- Keybindings --
vim.keymap.set('n', '<leader>w', '<cmd>write<cr>', {desc= 'Save'})

-- Copy/Paste from system clipboard
vim.keymap.set({'n', 'x'}, 'cp', '"+y')
vim.keymap.set({'n', 'x'}, 'cv', '"+p')

-- Delete text without changing internal registers
vim.keymap.set({'n', 'x'}, 'x', '"_x')

-- Select all text
vim.keymap.set('n', '<leader>a', ':keepjumps normal! ggVG<cr>')

-- Explorer
vim.keymap.set('n', '<leader>pv', vim.cmd.Ex)

-- Put Date on cursor
vim.keymap.set('n', '<leader>id', function () 
	if vim.bo.filetype == 'todo' then
		vim.cmd("put=system('date')")
	end
end)

