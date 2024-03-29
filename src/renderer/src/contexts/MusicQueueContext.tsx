import { createContext, useContext, useEffect, useState } from 'react'

const MusicQueueContext = createContext()

// TODO: Implement MusicPlayerContext
//
export const MusicQueueProvider = ({ children }) => {
  const [queue, setQueue] = useState([])
  const [credits, setCredits] = useState(10)

  const addSongToQueue = (song) => {
    setCredits((prev) => prev - 1)
    setQueue((prev) => [...prev, song])
  }

  const onSongEnd = () => {
    setQueue((prev) => prev.slice(1))
  }

  return (
    <MusicQueueContext.Provider
      value={{
        queue,
        credits,
        addSongToQueue
      }}
    >
      {children}
    </MusicQueueContext.Provider>
  )
}

export default MusicQueueContext

export const useMusicQueue = () => useContext(MusicQueueContext)
