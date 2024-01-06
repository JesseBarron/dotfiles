import React from 'react'
import {Provider} from 'react-redux'
import store from '../../../../shared/Redux/storeProxy'
import {csStore} from '../../../csStoreProxy'
import {csProxyStoreContext} from '../csProxyStoreContext'

/**
 * Wraps children with Providers for both the main store and dedicated tab id store.
 *
 * Main store is accessed with the default hooks `useSelector()`, `useDispatch()`, etc.
 * Tab store must be accessed via custom hooks from `../csProxyStoreContext`
 */
export const CsProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  return (
    <Provider store={csStore} context={csProxyStoreContext}>
      <Provider store={store}>{children}</Provider>
    </Provider>
  )
}
