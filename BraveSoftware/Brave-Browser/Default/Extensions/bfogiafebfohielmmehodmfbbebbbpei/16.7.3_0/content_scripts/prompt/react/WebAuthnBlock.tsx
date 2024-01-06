import {translateThis} from '@shared/locale'
import React from 'react'

interface SecurityKeySVGProps {
  d: string
  width: string
  height: string
  viewBox: string
}
type PositionType = 'static' | 'relative' | 'fixed' | 'absolute' | 'sticky'
const SecurityKeySVG: React.FC<SecurityKeySVGProps> = ({
  d,
  width,
  height,
  viewBox,
}: SecurityKeySVGProps) => {
  return (
    <svg width={width} height={height} viewBox={viewBox}>
      <path d={d} fill="black" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  )
}

export const WebAuthnBlock = () => {
  return (
    <div id="keeper-webauthn">
      <SecurityKeySVG
        width="40"
        height="40"
        viewBox="0 0 40 40"
        d="M1.6665 11.6667C1.6665 10.7463 2.41276 10 3.33317 10H26.6665C27.5869 10 28.3332 10.7463 28.3332 11.6667V13.3333H36.6665C37.5869 13.3333 38.3332 14.0796 38.3332 15V25C38.3332 25.9204 37.5869 26.6667 36.6665 26.6667H28.3332V28.3333C28.3332 29.2537 27.5869 30 26.6665 30H3.33317C2.41276 30 1.6665 29.2537 1.6665 28.3333V11.6667ZM28.3332 23.3333H34.9998V16.6667H28.3332V23.3333ZM14.9998 25C17.7613 25 19.9998 22.7614 19.9998 20C19.9998 17.2386 17.7613 15 14.9998 15C12.2384 15 9.99984 17.2386 9.99984 20C9.99984 22.7614 12.2384 25 14.9998 25Z"
      ></SecurityKeySVG>
      <div>{translateThis('insert_security_key')}</div>
    </div>
  )
}
