import Header from './components/header/Header'
import Sidebar from './components/sidebar/Sidebar'
import MediaPlayer from './components/MediaPlayer'
import { Outlet } from 'react-router-dom'
import { MusicQueueProvider } from './contexts/MusicQueueContext'
import AudioPlayer from './components/AudioPlayer'
import { useRef, useState } from 'react'
import CurrentSongProvider from './contexts/CurrentSongContext'

function App() {
  const audioRef = useRef(null)

  return (
    <>
      <MusicQueueProvider>
        <CurrentSongProvider>
          <div id="app">
            <Header />

            <Sidebar />

            <div id="main" style={{ gridArea: 'main' }} className="rounded">
              <Outlet />
            </div>

            <MediaPlayer />
          </div>

          <AudioPlayer />
        </CurrentSongProvider>
      </MusicQueueProvider>
    </>
  )
}

export default App
