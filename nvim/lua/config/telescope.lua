vim.pack.add({
  'https://github.com/nvim-telescope/telescope.nvim'
})

vim.pack.add({
  'https://github.com/nvim-telescope/telescope-fzf-native.nvim'
})

-- Auto-build telescope-fzf-native if not built
local fzf_native_path = vim.fn.stdpath('data') .. '/site/pack/core/opt/telescope-fzf-native.nvim'
local build_dir = fzf_native_path .. '/build'

if vim.fn.isdirectory(fzf_native_path) == 1 and vim.fn.isdirectory(build_dir) == 0 then
  vim.notify('Building telescope-fzf-native...', vim.log.levels.INFO)
  local result = vim.fn.system('cd ' .. vim.fn.shellescape(fzf_native_path) .. ' && make')
  if vim.v.shell_error == 0 then
    vim.notify('telescope-fzf-native built successfully! Please restart Neovim.', vim.log.levels.INFO)
  else
    vim.notify('Failed to build telescope-fzf-native: ' .. result, vim.log.levels.ERROR)
  end
end

-- Only load extension if it's built
if vim.fn.isdirectory(build_dir) == 1 then
  pcall(require('telescope').load_extension, 'fzf')
end

local builtin = require('telescope.builtin')

vim.keymap.set('n', '<leader><leader>', builtin.find_files, { desc = 'Telescope find files' })
vim.keymap.set('n', '<leader>fg', builtin.git_files, { desc = 'Telescope git files' })
vim.keymap.set('n', '<leader>/', builtin.live_grep, { desc = 'Telescope live grep' })
vim.keymap.set('n', '<leader>fb', builtin.buffers, { desc = 'Telescope buffers' })
vim.keymap.set('n', '<leader>fr', builtin.oldfiles, { desc = 'Telescope old files' })

