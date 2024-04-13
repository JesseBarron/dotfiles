-- Plugins
lvim.plugins = {
  {'phpactor/phpactor'},
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
    "vhyrro/luarocks.nvim",
    priority = 1000,
    config = true,
  },
  {
    "nvim-neorg/neorg",
    version = "7.0.0",
    build = ":Neorg sync-parsers",
    dependencies =  { "luarocks.nvim" },
    config = function ()
      Root_dir = '~/neorg';
      Work_dir = Root_dir .. '/work';
      Personal_dir = Root_dir .. '/personal';
      Notes_dir = Root_dir .. '/notes';
      Projects_dir = Root_dir .. '/projects';

      require('neorg').setup {
        load = {
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
                default = Root_dir,
                work = Work_dir,
                oncall = Work_dir..'/on-call',
                personal = Personal_dir,
                notes = Notes_dir,
                projects = Projects_dir,
              },
            }
          }
        }
      }
    end,
  },
  -- END: NEORG CONFIGURATION
  -- {
  --   'github/copilot.vim'
  -- }:
  {
    'JesseBarron/docker-buddy.nvim',
    config = function() require 'docker-buddy' end
  },
  {
    'David-Kunz/gen.nvim',
    opts = {
      model = 'mistral',
      display_mode = 'float',
      auto_close = false
    }
  }
}
