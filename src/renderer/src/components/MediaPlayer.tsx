import ThumbnailFallback from '../assets/thumbnail-fallback.webp'
import { RiVipCrownLine as CrownOutlineIcon, RiVipCrownFill as CrownFillIcon } from 'react-icons/ri'
import {
  IoPlaySkipBack as PreviousSongIcon,
  IoPlay as PlaySongIcon,
  IoPlaySkipForward as NextSongIcon
} from 'react-icons/io5'

import { getCoverBlob, secondsToMinutes } from '../lib/helper'
import { useCurrentSong } from '../contexts/CurrentSongContext'
import { useEffect, useState } from 'react'

const MediaPlayer = () => {
  const { currentSong, currentTime, duration, isPlaying } = useCurrentSong()
  const [cover, setCover] = useState(ThumbnailFallback)
  const [title, setTitle] = useState('Title')
  const [artistName, setArtistName] = useState('Artist')
  const [currentProgress, setCurrentProgress] = useState(0)

  const currentSongProgress = duration ? `${(currentTime / duration) * 100}%` : '0'

  useEffect(() => {
    if (currentSong.song && currentSong.song.coverPath) {
      setTitle(currentSong.song.name)
      setArtistName(currentSong.song.artist)
      ;(async () => {
        const coverData = await window.api.getCoverData(currentSong.song.coverPath)
        setCover(getCoverBlob(coverData))
      })()
    }
  }, [currentSong])

  useEffect(() => {
    let interval
    const startProgress = () => {
      interval = setInterval(() => {
        setCurrentProgress((prev) => {
          const newValue = (prev / 100) * duration + 0.025

          if (newValue >= duration) {
            clearInterval(interval)
          }

          return (newValue / duration) * 100
        })
      }, 25)
    }

    if (isPlaying) {
      startProgress()
    } else {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [setCurrentProgress, isPlaying])

  return (
    <div
      style={{ backgroundColor: 'black' }}
      className="absolute h-28 bg-black bottom-0 z-10 w-full rounded-none opacity-80 flex items-center justify-between px-6 gap-8"
    >
      {/* Thumbnail */}
      <div className="flex items-center">
        <div className="relative shrink-0">
          <img src={cover} alt="thumbnail" className="h-16 aspect-square rounded" />
          <VipIcon className="absolute top-1 left-1" isVip={true} />
        </div>

        <div className="text-white text-base ml-2 overflow-hidden grow-0">
          <p
            style={{ textOverflow: 'ellipsis' }}
            className="moving-text flex items-center gap-2 whitespace-nowrap"
          >
            {title}
          </p>
          <span className="text-xs text-outline">{artistName}</span>
        </div>
      </div>

      {/* Song duration & currentTime */}
      <div className="basis-3/5 flex flex-col-reverse items-center justify-center gap-2 shrink-0 roboto-mono-regular ">
        <div className="text-white text-xs">
          <span>{currentTime > 0 ? secondsToMinutes(currentTime) : '0:00'}</span>
          <span>/</span>
          <span>{duration ? secondsToMinutes(duration) : '0:00'}</span>
        </div>

        {/* Timeline */}
        <div className="w-4/5 h-[3px] bg-[#1a1a1a] relative ">
          <div style={{ width: `${currentProgress}%` }} className={`h-[3px] absolute bg-white `}>
            <div className="h-[8px] aspect-square rounded-full bg-white absolute translate-y-[-2px] right-0 cursor-pointer"></div>
          </div>
        </div>
        <div>
          <MediaControls />
        </div>
      </div>
    </div>
  )
}

export default MediaPlayer

function MediaControls({}) {
  const { playPauseSong } = useCurrentSong()

  function test() {
    console.log('clicked')
  }

  return (
    <div className="flex gap-3 mb-2">
      <PreviousSongIcon className="cursor-pointer h-4/5 text-white aspect-square" />
      <PlaySongIcon
        onClick={playPauseSong}
        className="cursor-pointer h-4/5 text-white aspect-square"
      />
      <NextSongIcon className="cursor-pointer h-4/5 text-white aspect-square" />
    </div>
  )
}

function VipIcon({ isVip, className }) {
  return isVip ? (
    <CrownFillIcon className={`text-yellow-300 ${className}`} />
  ) : (
    <CrownOutlineIcon className={className} />
  )
}
