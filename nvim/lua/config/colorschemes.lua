local default = 'melange'

vim.pack.add({
  'https://github.com/savq/melange-nvim'
})

vim.o.background = "dark"
vim.o.cursorline = true
vim.cmd.colorscheme(default)

-- Toggle light and dark mode Alt-m
local is_cooldown = false
vim.keymap.set("n", "<a-m>", function () 
  if is_cooldown then return end
  
  is_cooldown = true
  if vim.o.background == 'dark' then
    vim.o.background = 'light'
  else
    vim.o.background = 'dark'
  end

  vim.defer_fn(function () 
    is_cooldown = false
  end, 50)
end, {desc = "Toggle between dark and light background (The colorscheme will adapt)"})
