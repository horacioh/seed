import './tailwind.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import {TestEditor} from './TestEditor'

if (new URLSearchParams(window.location.search).get('theme') === 'dark') {
  document.documentElement.classList.add('dark')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestEditor />
  </React.StrictMode>,
)
