import React from 'react'

type CustomButtonProps = {
  id?: string
  className?: string
  textContent: string
  onClick?: () => void
}
export const CustomButton = ({
  id,
  className,
  textContent,
  onClick = () => {},
}: CustomButtonProps) => {
  return (
    <button id={id} className={className} onClick={onClick} style={{width: '140px'}}>
      {textContent}
    </button>
  )
}
