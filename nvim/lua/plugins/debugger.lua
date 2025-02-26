return {
  {
    "mfussenegger/nvim-dap",
    config = function()
      local dap = require("dap")
      dap.adapters.php = {
        type = "executable",
        command = "node",
        args = { "/home/jbarron/vscode-php-debug/out" },
      }

      dap.configurations.php = {
        type = "php",
        request = "launch",
        name = "Listen for xdebug",
        port = 9003,
      }
    end,
  },
  { "rcarriga/nvim-dap-ui", dependencies = { "mfussenegger/nvim-dap", "nvim-neotest/nvim-nio" } },
}
