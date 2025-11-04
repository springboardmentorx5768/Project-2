import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppNew from './AppNew.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppNew />
  </StrictMode>,
)
