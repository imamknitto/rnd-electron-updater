import { Fragment, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fragment>
      <App />
      <ToastContainer position="bottom-right" autoClose={4000} closeOnClick />
    </Fragment>
  </StrictMode>,
)
