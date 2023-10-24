lvim.builtin.which_key.mappings["bt"] = {
  "<cmd>tabnew<CR>", "New Tab"
}

lvim.builtin.which_key.mappings['h'] = {}
lvim.builtin.which_key.mappings['h'] = {
  name = "Hop",
  l = { "<cmd>HopChar2CurrentLine<CR>", "Hop Line" },
  p = { "<cmd>HopPattern<CR>", "Hop Pattern" }
}
