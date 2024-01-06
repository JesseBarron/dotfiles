import {configureStore} from '@reduxjs/toolkit'
import React from 'react'
import ReactDOM from 'react-dom/client'
import {Provider} from 'react-redux'
import {App} from './react/testunner'
import reducer from './redux/testrunner'

const store = configureStore({reducer})

document.addEventListener('DOMContentLoaded', () => {
  const rootDiv = document.getElementById('test-runner-root') as HTMLDivElement
  const app = React.createElement(App)
  const provider = React.createElement(Provider, {store, children: app})
  ReactDOM.createRoot(rootDiv).render(provider)
})
