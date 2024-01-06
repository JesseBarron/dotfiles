vim.cmd [[packadd packer.nvim]]

return require('packer').startup(function(use)
  -- Packer can manage itself
  use 'wbthomason/packer.nvim'

	use 'rstacruz/vim-closer'

	-- Fuzzy Finder
	use {
		'nvim-telescope/telescope.nvim', tag = '0.1.2',
		-- or                            , branch = '0.1.x',
		requires = { {'nvim-lua/plenary.nvim'} }
	}

	-- Theme
	use "savq/melange-nvim"

	-- Status Bar
	use 'feline-nvim/feline.nvim'
	use 'nvim-tree/nvim-web-devicons'

	use('nvim-treesitter/nvim-treesitter', {run= ':TSUpdate'})
	use 'ThePrimeagen/harpoon'
	use 'mbbill/undotree'
	use 'tpope/vim-fugitive'
	use {
		'VonHeikemen/lsp-zero.nvim',
		branch = 'v2.x',
		requires = {
			-- LSP Support
			{'neovim/nvim-lspconfig'},             -- Required
			{'williamboman/mason.nvim'},           -- Optional
			{'williamboman/mason-lspconfig.nvim'}, -- Optional

			-- Autocompletion
			{'hrsh7th/nvim-cmp'},     -- Required
			{'hrsh7th/cmp-nvim-lsp'}, -- Required
			{'L3MON4D3/LuaSnip'},     -- Required
		}
	}
	use 'ThePrimeagen/vim-be-good'
	use 'aserebryakov/vim-todo-lists'
	use {
		'prettier/vim-prettier',
		run = 'yarn install',
		ft = {'javascript', 'typescript', 'css', 'less', 'scss', 'graphql', 'markdown', 'vue', 'html'}
	}
	-- tmux integration
	use 'christoomey/vim-tmux-navigator'

	-- comments
	use {
		'numToStr/Comment.nvim',
		config = function()
			require('Comment').setup()
		end
	}
end)

