import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const savedTheme = localStorage.getItem('theme')
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
document.documentElement.classList.toggle('dark', savedTheme ? savedTheme === 'dark' : prefersDark)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
