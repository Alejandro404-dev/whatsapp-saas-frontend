import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx' // Asegúrate de que la ruta y el nombre coincidan
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)