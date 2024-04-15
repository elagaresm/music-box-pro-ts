import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import { loader as artistsLoader } from './routes/Artists'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import Artists from './routes/Artists'
import ErrorPage from './routes/ErrorPage'
import ArtistType, { loader as artistLoader } from './routes/Artist'

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Artists />, loader: artistsLoader },
      { path: 'artist/:artistName', element: <ArtistType />, loader: artistLoader }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
