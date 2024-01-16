DEFAULT_COMMIT_MSG = "Neorg Auto Commit"
NEORG_DIR = "~/neorg"

-- VimLeavePre -- Could be used to squash commits and push changes before closing vim

-- BufUnload - Only commit when closing norg buffers
vim.api.nvim_create_autocmd({"BufUnload"}, {
  pattern  = "*.norg",
  callback =  function(ev)
    local output = vim.fn.systemlist('git -C '..NEORG_DIR..' status -s')

    if RepoHasChanges(output) then
      print("Ok We're pushing changes for this file ".. ev.file)
      CommitChanges()
      pushChanges()
    end
  end
})

function pushChanges()
  local output = vim.fn.systemlist('git -C '..NEORG_DIR..' status')
  LOG(output)
end

function CommitChanges()
  vim.fn.systemlist('git -C '..NEORG_DIR..' add .')
  vim.fn.systemlist('git -C '..NEORG_DIR..' commit -m "'.. DEFAULT_COMMIT_MSG..'"')
end

function RepoHasChanges(gitStatus)
  if next(gitStatus) == nil then return false end
  if string.match(gitStatus[1], 'fatal') then return false end

  return true
end

