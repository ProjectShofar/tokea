import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/tailwind.css'
import { setConfig } from './utils/fetcher.js'

setConfig({
  api: 'http://localhost:3333'
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
