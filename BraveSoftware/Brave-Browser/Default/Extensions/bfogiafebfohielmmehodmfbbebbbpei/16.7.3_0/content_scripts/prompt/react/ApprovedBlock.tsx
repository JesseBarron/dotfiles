import React from 'react'
type ApprovedBlockProps = {
  imageClass: string
  message: string
}
export const ApprovedBlock = ({imageClass, message}: ApprovedBlockProps) => {
  return (
    <div id="device-approved">
      <div className={`approved-image ${imageClass}`}></div>
      <div className="approved-message">{message}</div>
    </div>
  )
}
