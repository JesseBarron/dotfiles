return {
  {
    "JesseBarron/docker-buddy.nvim",
    dir = "~/projects/docker-buddy.nvim",
    dev = { true },
    config = function()
      require("docker-buddy")
    end,
  },
}
