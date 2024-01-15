-- Goal
-- I want changes to neorg files to be autoamatically be pushed in the background

-- How will this be done?

-- Anytime a neorg file is closd, a command will check if there are changes in the neorg directory
-- if there is, then a new commit chould be made, for now we can use a generic commit message. Then it should be pushed.
-- Ideally this should be done in the background


-- Use a vim conmmand to listen for buffer closing
-- autocommands to listen with
-- BufWinLeave

vim.api.nvim_create_autocmd({"BufWinLeave"}, {
  pattern  = "*.norg",
  callback =  function(ev)
    local filePath = string.gsub(ev.match, ev.file, "")
    local output = vim.fn.systemlist('git -C '..filePath..' status -s')

    if RepoHasChanges(output) then print("Ok We're pushing changes for this file".. ev.file) end
  end
})


-- AreNorgBufsOpen: Checks if any neorg buffs are open

function RepoHasChanges(gitStatus)
  if next(gitStatus) == nil then return false end
  if string.match(gitStatus[1], 'fatal') then return false end

  return true
end

