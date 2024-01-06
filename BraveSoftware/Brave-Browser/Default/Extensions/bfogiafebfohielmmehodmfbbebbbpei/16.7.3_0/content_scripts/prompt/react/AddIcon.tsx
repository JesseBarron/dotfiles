import React, {useState, useEffect, useRef} from 'react'

interface AddIconSVGProps {
  d: string
  width: string
  height: string
  viewBox: string
  fill?: string
}
type PositionType = 'static' | 'relative' | 'fixed' | 'absolute' | 'sticky'
const AddIconSVG: React.FC<AddIconSVGProps> = ({
  d,
  width,
  height,
  viewBox,
  fill,
}: AddIconSVGProps) => {
  return (
    <svg width={width} height={height} viewBox={viewBox}>
      <path d={d} fill={fill} />
    </svg>
  )
}
interface AddIconProps {
  Position: PositionType
}
export const AddIcon = ({Position}: AddIconProps) => {
  const [disabled, setDisabled] = useState<boolean>(false)
  const [cursor, setCursor] = useState<string>('pointer')
  const [opacity, setOpacity] = useState<string>('0.5')
  const [position, setPosition] = useState<PositionType>('static')
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current == null) return
    if (ref.current?.hasOwnProperty('disabled')) return
    Object.defineProperty(ref.current, 'disabled', {
      get: () => disabled,
      set: setDisabled,
    })
    setPosition(Position)
  }, [ref])
  useEffect(() => {
    disabled ? setCursor('not-allowed') : setCursor('pointer')
    disabled ? setOpacity('0.5') : setOpacity('1')
  }, [disabled])
  return (
    <div
      className="keeper-iconbutton-add"
      id="keeper-iconbutton-add"
      ref={ref}
      style={{cursor: cursor, opacity: opacity, position: position}}
    >
      <AddIconSVG
        d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      />
    </div>
  )
}
