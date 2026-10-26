import React from 'react'
import ReactDOM from 'react-dom/client'
import './a11y-foundations.css'
import {A11yFoundations} from './A11yFoundations'
import {TestSchemaEditor} from './TestSchemaEditor'

document.documentElement.classList.toggle('dark', new URLSearchParams(location.search).get('theme') === 'dark')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {location.pathname === '/a11y-foundations' ? <A11yFoundations /> : <TestSchemaEditor />}
  </React.StrictMode>,
)
