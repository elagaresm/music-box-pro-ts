import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { createHashRouter, RouterProvider } from 'react-router-dom'

const router = createHashRouter([
  {
    path: '/',
    element: <App />
    /* loader: appLoader,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Main />, loader: appLoader },
      { path: "artist/:artistName", element: <Artist />, loader: artistLoader },
    ], */
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
