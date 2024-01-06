import TriangleWarning from '@shared/svgMaker/triangleWarning'
import React from 'react'
export type ErrorPromptBLockProps = {
  children?: React.ReactNode
  errorText?: string
  isRemoved?: boolean
  isDelete?: boolean
}
export const ErrorPromptBlock = ({
  children,
  errorText,
  isRemoved = false,
  isDelete = true,
}: ErrorPromptBLockProps) => {
  return !isDelete ? (
    <div id="error" className="error">
      <div className="error_text">
        <div>
          <TriangleWarning svgColorName="#CE021B" width={32} height={32} />
        </div>
        {errorText}
      </div>
      {!isRemoved && <button className="button primary">Open Vault</button>}
      {children}
    </div>
  ) : null
}
