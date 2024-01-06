import React, {useEffect, useRef} from 'react'
import {keeperDropdownToggle} from '../../prompt/inner/class-functions/toggles'
interface DropdownToggleProps {
  height: string
  width: string
}
export const DropdownToggle: React.FC<DropdownToggleProps> = ({
  height,
  width,
}: DropdownToggleProps) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current == null) return
    if (ref.current?.hasOwnProperty('opened')) {
      return
    }
    Object.defineProperty(ref.current, 'opened', {
      get: keeperDropdownToggle.getOpened,
      set: keeperDropdownToggle.setOpened,
    })
  }, [ref])
  return (
    <div
      className="keeper-dropdown-toggle"
      id="keeper-dropdown-toggle"
      ref={ref}
      style={{height: height, width: width}}
    ></div>
  )
}
