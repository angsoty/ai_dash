import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppRouter } from './app/router'
import './index.css' // 🔹 ត្រូវប្រាកដថាមាន Tailwind Directives នៅក្នុងនេះ

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
)