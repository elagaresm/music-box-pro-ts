import { useEffect, useRef } from 'react'
import { useLoaderData } from 'react-router-dom'
import { getCoverBlob, matrixOnEvent } from '../lib/helper'
import { Artist as ArtistType, Album as AlbumType, Song as SongType } from '@renderer/env'
import Collage from './components/Collage'

export async function loader({ params }): Promise<ArtistType | null> {
  try {
    const artist = await window.api.getArtistByName(decodeURIComponent(params.artistName))
    return artist
  } catch (error) {
    console.error('Could not load artist: ', error)
    throw new Error()
  }
}

const Artist = (): JSX.Element => {
  const artist = useLoaderData() as ArtistType
  const artistName = artist.name

  const artistNameRef = useRef() as React.MutableRefObject<HTMLHeadingElement>

  useEffect(() => matrixOnEvent(artistNameRef), [])

  const covers: string[] = artist.albums
    .filter((album) => {
      return album.cover !== null
    })
    .map((album) => {
      return getCoverBlob(album.cover as Buffer)
    })

  return (
    <div className="h-full flex flex-col items-center pt-3 px-16 text-white">
      {/* Artist Name */}
      <div className="mb-12">
        <h2
          ref={artistNameRef}
          data-value={artistName}
          className="text-5xl mt-6 text-center roboto-mono-regular"
        >
          {artistName}
        </h2>
      </div>

      {/* Albums */}
      {artist.albums.map((album) => (
        <Album album={album} key={album.name} />
      ))}
    </div>
  )
}

export default Artist

function Album({ album }: { album: AlbumType }): JSX.Element {
  return (
    <div className="w-full">
      <h3 className="text-lg mb-3">{album.name}</h3>
      <ul className="h-[100px] gap-2 flex mb-12 bg-[#151515] w-max">
        {album.songs && album.songs.map((song) => <Song song={song} key={song.name} />)}
      </ul>
    </div>
  )
}

function Song({ song }: { song: SongType }): JSX.Element {
  const largeText = song.name.length > 12
  return (
    <li className="flex-1 max-w-28 min-w-28 hover:text-accent hover:scale-105 duration-300 cursor-pointer">
      <img
        src={getCoverBlob(song.cover as Buffer)}
        alt="song cover"
        className="w-full h-full object-cover mb-2"
      />
      <div className="overflow-hidden">
        <p className={`whitespace-nowrap ${largeText && 'moving-text'} hover:text-accent`}>
          {song.name}
        </p>
      </div>
    </li>
  )
}
