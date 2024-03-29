import React from 'react'
import { PiPlaylistBold as PlayListIcon } from 'react-icons/pi'
import { Link } from 'react-router-dom'
import { useMusicQueue } from '../../contexts/MusicQueueContext'

const Sidebar = () => {
  const { queue = [] } = useMusicQueue()

  return (
    <div style={{ gridArea: 'sidebar' }} className="flex flex-col items-between p-2 rounded">
      <Link to="/">
        <div className="border-b border-outline p-2 text-center">
          <h1 className="text-white upper relative font-bold text-[32px]">
            MusicBox
            <span className="uppercase absolute right-2 text-xs text-accent">Pro</span>
          </h1>
        </div>
      </Link>
      <div className="basis-full">
        <div className="flex flex-col justify-center items-center gap-1">
          <div className="flex gap-1 items-center">
            <PlayListIcon className="text-outline text-xs" />
            <h3 className="text-outline text-xs text-center my-2">Lista de reproducción</h3>
          </div>
          <ul>
            {queue.map((song, index) => {
              if (index === 0) {
                return (
                  <li key={song.path.concat(index)} className="text-blue-300 text-xs">
                    {index + 1}. {song.name}
                  </li>
                )
              }
              return (
                <li key={song.path.concat(index)} className="text-white text-xs">
                  {index + 1}. {song.name}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
