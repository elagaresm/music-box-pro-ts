import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useMusicQueue } from './MusicQueueContext'

const CurrentSongContext = createContext()

const CurrentSongProvider = ({ children }) => {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState({})
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const { queue } = useMusicQueue()

  /*   Get the song data everytime current song changes */
  useEffect(() => {
    if (!currentSong.song) {
      return
    }
    ;(async () => {
      const song = await window.api.getSongData(currentSong.song.path)
      const blob = new Blob([song], { type: 'audio/mp3' })
      const songBlob = URL.createObjectURL(blob)
      audioRef.current.src = songBlob
      // audioRef.current.play()
    })()
  }, [currentSong])

  function playPauseSong() {
    console.log('clicked')
    if (isPlaying) {
      return audioRef.current.pause()
    }
    audioRef.current.play()
  }

  useEffect(() => {
    if (queue.length > 0 && !currentSong.song) {
      setCurrentSong(() => ({ song: queue[0] }))
    }
  }, [queue])

  return (
    <CurrentSongContext.Provider
      value={{
        isPlaying,
        setIsPlaying,
        currentSong,
        setCurrentSong,
        currentTime,
        setCurrentTime,
        duration,
        setDuration,
        audioRef,
        playPauseSong
      }}
    >
      {children}
    </CurrentSongContext.Provider>
  )
}

export default CurrentSongProvider

export const useCurrentSong = () => useContext(CurrentSongContext)
