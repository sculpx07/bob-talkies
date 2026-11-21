import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AdminApp } from './App'
import './styles/admin.css'

// Entry for /admin (admin/index.html). The customer site starts from src/app/main.tsx.
const root = document.getElementById('admin-root')
if (!root) throw new Error('#admin-root element not found')

createRoot(root).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
)
