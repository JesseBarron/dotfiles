-- Save exit 
vim.keymap.set('n', '<leader>qq', '<cmd>qa!<cr>', {desc = 'Force quit nvim'})
vim.keymap.set({'v', 'i', 'n'}, '<c-s>', '<cmd>w<cr><esc>', {desc = 'Force quit nvim'})

-- Buffer
vim.keymap.set('n', '<leader>bd', '<cmd>bd<cr>', {desc = 'close current buffer'})
vim.keymap.set('n', '<Leader>bo', function()
  local current_buf = vim.api.nvim_get_current_buf()
  local deleted_bufs = 0
  for _, bufnr in ipairs(vim.api.nvim_list_bufs()) do
    if vim.api.nvim_buf_is_valid(bufnr) 
       and vim.bo[bufnr].buftype ~= "terminal" 
       and bufnr ~= current_buf 
    then
      vim.api.nvim_buf_delete(bufnr, {})
      deleted_bufs = deleted_bufs + 1
    end
  end
  print('Buffers Deleted: '..deleted_bufs)
  deleted_bufs = 0
end, { desc = "Close all other non-terminal buffers" })

vim.keymap.set('n', 'L', '<cmd>bn<cr>', {desc = 'Nav Next buffer'})
vim.keymap.set('n', 'H', '<cmd>bp<cr>', {desc = 'Nav Previous buffer'})

-- Window
vim.keymap.set('n', '<leader>wv', '<cmd>wincmd v<cr>', {desc = 'split vertically'})
vim.keymap.set('n', '<leader>wh', '<cmd>split<cr>', {desc = 'split horizontally'})
vim.keymap.set('n', '<leader>wd', '<cmd>wincmd c<cr>', {desc = 'close current window'})
vim.keymap.set('n', '<leader>wo', '<cmd>only<cr>', { desc = 'Close all other windows (Maximize current)' })

vim.keymap.set('n', '<c-l>', '<cmd>wincmd l<cr>', {desc = 'Move cursor to right window'})
vim.keymap.set('n', '<c-h>', '<cmd>wincmd h<cr>', {desc = 'Move cursor to left window'})
vim.keymap.set('n', '<c-j>', '<cmd>wincmd j<cr>', {desc = 'Move cursor to bottom window'})
vim.keymap.set('n', '<c-k>', '<cmd>wincmd k<cr>', {desc = 'Move cursor to top window'})

-- Window Resizing
local resizeFactor = 3
vim.keymap.set('n', '<c-up>', resizeFactor..'<c-W>+')
vim.keymap.set('n', '<c-down>', resizeFactor..'<c-W>-')
vim.keymap.set('n', '<c-left>', resizeFactor..'<c-W>>')
vim.keymap.set('n', '<c-right>', resizeFactor..'<c-W><')


-- Push File Path to '+' Registry
vim.keymap.set('n', '<C-g>', function()
  vim.fn.setreg('+', vim.fn.expand('%:p'))
end, { noremap = true, silent = true, desc = 'Push File Path to "+" Registry' })



vim.keymap.set({'v', 'n'}, '<a-j>', '<cmd>m .+1<cr>', {desc='Move block down'})
vim.keymap.set({'v', 'n'}, '<a-k>', '<cmd>m .-2<cr>', {desc='Move block up'})
