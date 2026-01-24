import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider } from '@mantine/core'

import App from './App'
import './style.css'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import { materialTheme } from './theme'

ReactDOM.createRoot(document.querySelector<HTMLDivElement>('#app')!).render(
  <React.StrictMode>
    <MantineProvider theme={materialTheme}>
      <App />
    </MantineProvider>
  </React.StrictMode>,
)

