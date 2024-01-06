import React from 'react'
import BaseKeeperExtension from './BaseKeeperExtension'
import {closeFormFiller} from '../../../misc/closeFormFiller'
import ReviewSavedRecord from '../../inputHelpers/ReviewSavedRecord'

const KeeperReviewSavedRecordExtension: React.FC = () => {
  return <BaseKeeperExtension handleCloseButton={closeFormFiller} content={<ReviewSavedRecord />} />
}

export default KeeperReviewSavedRecordExtension
