return {}
-- return {
--   {
--     "nvim-neorg/neorg",
--     version = "7.0.0",
--     build = ":Neorg sync-parsers",
--     -- dependencies = { "luarocks.nvim" },
--     config = function()
--       Root_dir = "~/neorg"
--       Work_dir = Root_dir .. "/work"
--       Personal_dir = Root_dir .. "/personal"
--       Notes_dir = Root_dir .. "/notes"
--       Projects_dir = Root_dir .. "/projects"
--
--       require("neorg").setup({
--         load = {
--           ["core.completion"] = {
--             config = {
--               engine = "nvim-cmp",
--               name = "[Neorg]",
--             },
--           },
--           ["core.journal"] = {
--             config = {
--               journal_folder = "journal",
--               strategy = "nested",
--             },
--           },
--           ["core.defaults"] = {},
--           ["core.concealer"] = {},
--           ["core.dirman"] = {
--             config = {
--               workspaces = {
--                 default = Root_dir,
--                 work = Work_dir,
--                 oncall = Work_dir .. "/on-call",
--                 personal = Personal_dir,
--                 notes = Notes_dir,
--                 projects = Projects_dir,
--               },
--             },
--           },
--         },
--       })
--     end,
--   },
-- }
