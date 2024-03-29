import { useEffect, useRef, useState } from 'react'
import { useLoaderData } from 'react-router-dom'
import { getCoverBlob, secondsToMinutes } from '../lib/helper'
import { SlOptions as OptionsIcon } from 'react-icons/sl'
import { useMusicQueue } from '../contexts/MusicQueueContext'
import { ArtistByName } from '@renderer/env'

export async function loader({ params }): Promise<{ artist: ArtistByName | null }> {
  try {
    const artist = await window.api.getArtistByName(decodeURIComponent(params.artistName))
    return { artist }
  } catch (error) {
    console.log('Could not load artist: ', error)
    throw new Error()
  }
}

const Artist = (): JSX.Element => {
  const { artist } = useLoaderData() as { artist: ArtistByName }

  console.log('artist: ', artist)
  const artistNameRef = useRef() as React.MutableRefObject<HTMLHeadingElement>

  useEffect(() => {
    if (!artistNameRef.current) {
      return
    }
    const letters = 'abcdefghijklmnopqrstuvwxyz'
    let iterations = 0
    const interval = setInterval(() => {
      if (artistNameRef.current.dataset.value || !artistNameRef.current) {
        clearInterval(interval)
        return
      }
      artistNameRef.current.innerText = artistNameRef.current.innerText
        .split('')
        .map((letter, index) => {
          if (letter === ' ') {
            return letter
          }
          if (index < iterations) {
            return artistNameRef.current.dataset.value?.[index] ?? letter
          }
          if (letter.toLowerCase() === letter) {
            return letters[Math.floor(Math.random() * 26)]
          }
          return letters[Math.floor(Math.random() * 26)].toUpperCase()
        })
        .join('')

      if (iterations >= artistNameRef.current.innerText.length) {
        clearInterval(interval)
      }

      iterations += 1 / 2
    }, 30)
  }, [artistNameRef])

  // const {
  //   artist: { name },
  //   cover,
  //   songs
  // } = artist

  const covers: string[] = []

  for (const album in artist) {
    const { cover } = artist[album]
    if (cover) {
      covers.push(getCoverBlob(cover))
    }
  }

  // const coverData = getCoverBlob(cover)

  return (
    <div className="h-full flex flex-col items-center pt-3 px-16 text-white">
      <div className="mb-12">
        <img src={coverData} alt="artist cover" className="rounded-md" />
        <h2
          ref={artistNameRef}
          data-value={name}
          className="text-5xl mt-6 text-center roboto-mono-regular"
        >
          {name}
        </h2>
        <p className="text-outline text-center">{songs.length} songs</p>
      </div>
      <ul className="text-white w-full">
        {songs.map((song) => {
          return <ArtistSong key={song.name} song={song} />
        })}
      </ul>
    </div>
  )
}

export default Artist

function ArtistSong({ song }) {
  const [durationLabel, setDurationLabel] = useState('0')
  const { addSongToQueue } = useMusicQueue()

  useEffect(() => {
    ;(async () => {
      const songDuration = await window.api.getSongDuration(song.path)
      setDurationLabel(secondsToMinutes(songDuration))
    })()
  }, [])

  return (
    <li className="border-b-[1px] mb-3 w-full flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* TODO: Set hover bg */}
        <button
          onClick={() => addSongToQueue(song)}
          className="rounded-full hover:bg-outline w-8 h-8 flex items-center justify-center"
        >
          <PlayIcon className="text-white w-4 h-4" />
        </button>
        <div className="grid grid-rows-2 gap-1">
          <p className="text-lg">{song.name}</p>
          <p className="text-outline text-sm">{durationLabel}</p>
        </div>
      </div>
      <button>
        <OptionsIcon className="text-white" />
      </button>
    </li>
  )
}

function PlayIcon(props): JSX.Element {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}
