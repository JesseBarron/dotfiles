import React from 'react'
import {useSelector} from 'react-redux'
import classNames from 'classnames'
import {getOS, getTheme} from '../../../../../shared/Redux/selectors'
import useResizeDetector from '../../hooks/useResizeDetector'
import locale from '../../../../../shared/locale'
import KeeperExtensionHeader from '../headers/KeeperExtensionHeader'
import {KeeperHeaderOptions} from '../../types'
import {useOverlayShadow} from '../../hooks/useOverlayShadow'
import {setOverlayShadow} from '../../utils/modeSelectorUtils'
import {getExtensionPayload} from '../../utils/extensionPayloads'

type BaseKeeperExtensionProps = {
  handleCloseButton: () => void
  content: React.ReactNode
  headerOption?: KeeperHeaderOptions
  leadingHeaderIcon?: React.ReactNode
  useClassicHeaderTheme?: boolean
}

const BaseKeeperExtension: React.FC<BaseKeeperExtensionProps> = (props) => {
  const {handleCloseButton, content, headerOption, leadingHeaderIcon, useClassicHeaderTheme} = props
  const {width, name} = getExtensionPayload()
  const isOverlayShadow = useOverlayShadow()

  const isRTL = locale.useRTL()

  useResizeDetector('keeper-extension-root')

  const {theme, mode} = useSelector(getTheme)

  const os = useSelector(getOS)

  const className = classNames(
    name,
    `keeper-theme-${useClassicHeaderTheme ? 'classic' : theme}`,
    'large',
    `${mode}-mode`,
    os,
    {
      rtl: isRTL,
    }
  )

  const handleClick = () => {
    isOverlayShadow && setOverlayShadow(false)
  }

  return (
    <div id="keeper-extension" className={className} style={{width}} onClick={handleClick}>
      {headerOption !== KeeperHeaderOptions.None && (
        <KeeperExtensionHeader
          handleCloseButton={handleCloseButton}
          leadingHeaderIcon={leadingHeaderIcon}
          headerOption={headerOption}
        />
      )}
      {content}
      {isOverlayShadow && <div id="overlay-shadow"></div>}
    </div>
  )
}

export default BaseKeeperExtension
