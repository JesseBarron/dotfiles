import React from 'react'

type TwoFactorCodeProps = {
  validateInput: (e: React.FormEvent<HTMLInputElement>) => void
}
export const TwoFactorCode = ({validateInput}: TwoFactorCodeProps) => {
  return <input type="password" onInput={validateInput}></input>
}
