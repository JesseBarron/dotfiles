import React from 'react'
import locale from '../../../../../shared/locale'
import language from '../../../../../shared/locale'
import classNames from 'classnames'
import KeeperIconButton from '../elements/buttons/KeeperIconButton'
import {getOverlayShadow, setOverlayShadow} from '../../utils/modeSelectorUtils'
import sizeDraggableElementOnHeader from '../../../../misc_functions/elementHelpers/sizeDraggableElementOnHeader'
import {constants} from '../../../../contentScriptsConstants'

const popupMenuItems = [{title: 'Action_edit'}, {title: 'create_new'}, {title: 'change_password'}]

const PopupMenu = () => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    sizeDraggableElementOnHeader(constants.DraggableStyles.closeSelf)
  }

  return (
    <div id="edit-menu" className="keeper-div" role="menu" style={{display: 'block'}}>
      {popupMenuItems.map((item, idx) => (
        <div className="keeper-div" key={idx} role="button" tabIndex={0} onClick={handleClick}>
          {language.translateThis(item.title)}
        </div>
      ))}
    </div>
  )
}

const HeaderMoreIcon = () => {
  const rtl = locale.useRTL() ? 'rtl' : 'ltr'
  let isOverlayShadow = getOverlayShadow()

  const handleMenuClick = () => {
    isOverlayShadow = !isOverlayShadow
    setOverlayShadow(isOverlayShadow)
  }

  return (
    <KeeperIconButton
      id="menubutton"
      type="moreIcon"
      role="button"
      className={rtl}
      ariaLable="Menu Button. Menu to Edit, Create, or Change Records."
      ariaHasPopup={true}
      overlayShadow={isOverlayShadow}
      onClick={handleMenuClick}
    >
      {isOverlayShadow && <PopupMenu />}
    </KeeperIconButton>
  )
}

export default HeaderMoreIcon
