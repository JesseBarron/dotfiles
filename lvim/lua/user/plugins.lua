-- Plugins
lvim.plugins = {
  {
    'mbbill/undotree',
    config = function()
      vim.keymap.set('n', '<leader>u', vim.cmd.UndotreeToggle)
    end
  },
  { 'sindrets/diffview.nvim' },
  { "nvim-telescope/telescope-dap.nvim" },
  { "catppuccin/nvim" },
  { 'christoomey/vim-tmux-navigator' },
  {
    "iamcco/markdown-preview.nvim",
    cmd = { "MarkdownPreviewToggle", "MarkdownPreview", "MarkdownPreviewStop" },
    build = "cd app && yarn install",
    init = function()
      vim.g.mkdp_filetypes = { "markdown" }
    end,
    ft = { "markdown" },
  }, { 'phaazon/hop.nvim' },
  { 'nvim-lua/plenary.nvim' },
  -- NEORG CONFIGURATION
  {
    "nvim-neorg/neorg",
    build = ":Neorg sync-parsers",
    dependencies =  {
      "nvim-lua/plenary.nvim",
      { "pysan3/neorg-templates", dependencies = { "L3MON4D3/LuaSnip" } }, -- ADD THIS LINE
    },
    config = function ()
      Root_dir = '~/neorg';
      Work_dir = Root_dir .. '/work';
      Personal_dir = Root_dir .. '/personal';
      Notes_dir = Root_dir .. '/notes';

      require('neorg').setup {
        load = {
          ['external.templates'] = {
            config = {
              templates_dir = '~/neorg/templates',
            },
          },
          ['core.completion'] = {
            config = {
              engine = 'nvim-cmp',
              name = '[Neorg]',
            }
          },
          ['core.journal'] = {
            config = {
              journal_folder = 'journal',
              strategy = 'nested',
            },
          },
          ['core.defaults'] = {},
          ['core.concealer'] = {},
          ['core.dirman'] = {
            config = {
              workspaces = {
                root = Root_dir,
                work = Work_dir,
                oncall = Work_dir..'/on-call',
                personal = Personal_dir,
                notes = Notes_dir,
              },
            }
          }
        }
      }
    end,
  },
  -- END: NEORG CONFIGURATION
  --
  -- {
  --   'JesseBarron/docker-buddy.nvim',
  --   config = function() require 'docker-buddy' end
  -- },
}
