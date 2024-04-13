lvim.builtin.which_key.mappings["bt"] = {
  "<cmd>tabnew<CR>", "New Tab"
}

lvim.builtin.which_key.mappings['n'] = {
  name = 'Nvim Development',
  x = { "<cmd>source %<CR>", "Execute Current File"},
  t = { "<Plug>PlenaryTestFile", "Run Current Test File"}
}

-- Neorg mappings
lvim.builtin.which_key.mappings['O'] = {
  name = 'Neorg',
  w = { ':Neorg workspace <Right>', "Open a workspace of your choosing" },
  j = { '<cmd>Neorg journal today<CR>', 'Open journey entry for today' }
}

-- Datagrip launcher
vim.keymap.set('n', '<C-D>', "<cmd>!datagrip &>/dev/null & <cr><cr>");
