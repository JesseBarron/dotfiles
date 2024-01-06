import React from 'react'

type EyeballProps = {
  onClick: () => void
}
export const Eyeball = ({onClick}: EyeballProps) => {
  return <div id="eyeball" onClick={onClick}></div>
}
