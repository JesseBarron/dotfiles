__P = function(v)
  print(vim.inspect(v))
  return v
end


function __parseTraceback(stackTrace)
  local t = {}

  for s in stackTrace:gmatch("[^\r\n]+") do
    table.insert(t, s)
  end

  return t
end

-- Lets make debugging easier
--
-- I want to be able to turn logging on and off easily (DONE .. could be a little more elegant)
--
-- I want to be able to see where the log came from.. file and line.. (DONE?)
--
-- I want to be able to scope logs to the file I'm looking at..

vim.g.ENABLE_LOGS = "false"

LOG = function(v)
  local stackTrace = __parseTraceback(debug.traceback())

  local log = {
    log = v,
    -- This is a short format as the third element is th function that called this log function
    -- I might want to add a "verbose" flag for debugging that prints the entire traceback.
    location = vim.fn.split(stackTrace[3], ' ')[1]
  }

  if (vim.g.ENABLE_LOGS == "true") then __P(log) end
end
