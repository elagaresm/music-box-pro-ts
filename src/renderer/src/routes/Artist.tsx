import { useEffect, useRef } from 'react'
import { useLoaderData } from 'react-router-dom'
import { getCoverBlob, matrixOnEvent } from '../lib/helper'
import { SlOptions as OptionsIcon } from 'react-icons/sl'
// import { useMusicQueue } from '../contexts/MusicQueueContext'
import { Artist as ArtistType, Album as AlbumType } from '@renderer/env'
import Collage from './components/Collage'

export async function loader({ params }): Promise<ArtistType | null> {
  try {
    const artist = await window.api.getArtistByName(decodeURIComponent(params.artistName))
    if (artist !== undefined) console.log('artist found')
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
      <div className="h-[25vh] aspect-square bg-[#151515] rounded-lg overflow-hidden">
        <Collage images={covers} />
      </div>
      <div className="mb-12">
        <h2
          ref={artistNameRef}
          data-value={artistName}
          className="text-5xl mt-6 text-center roboto-mono-regular"
        >
          {artistName}
        </h2>
      </div>
      <AlbumList albums={artist.albums} />
    </div>
  )
}

export default Artist

function AlbumList({ albums }: { albums: AlbumType[] }): JSX.Element {
  if (!albums) {
    return (
      <p className="text-outline roboto-mono-regular">There are no albums or the album is empty</p>
    )
  }

  return (
    <ul className="w-full">
      {albums.map((album) => (
        <Album key={album.name} album={album} />
      ))}
    </ul>
  )
}

function Album({ album }: { album: AlbumType }): JSX.Element {
  console.log(album)
  console.log('album name:', album.name)
  return (
    <li className="border-b-[1px] mb-3 w-full">
      <h3 className="text-lg mb-2">{album.name}</h3>
      <ul>
        {album.songs &&
          album.songs.map((song) => (
            <li key={song.name} className="flex items-center justify-between">
              <p>{song.name}</p>
              <button>
                <OptionsIcon className="text-white" />
              </button>
            </li>
          ))}
      </ul>
    </li>
  )
}

// function ArtistSong({ song }) {
//   const [durationLabel, setDurationLabel] = useState('0')
//   const { addSongToQueue } = useMusicQueue()

//   useEffect(() => {
//     ;(async () => {
//       const songDuration = await window.api.getSongDuration(song.path)
//       if (songDuration) {
//         setDurationLabel(secondsToMinutes(songDuration))
//       }
//     })()
//   }, [])

//   return (
//     <li className="border-b-[1px] mb-3 w-full flex items-center justify-between">
//       <div className="flex items-center gap-4">
//         {/* TODO: Set hover bg */}
//         <button
//           onClick={() => addSongToQueue(song)}
//           className="rounded-full hover:bg-outline w-8 h-8 flex items-center justify-center"
//         >
//           <PlayIcon className="text-white w-4 h-4" />
//         </button>
//         <div className="grid grid-rows-2 gap-1">
//           <p className="text-lg">{song.name}</p>
//           <p className="text-outline text-sm">{durationLabel}</p>
//         </div>
//       </div>
//       <button>
//         <OptionsIcon className="text-white" />
//       </button>
//     </li>
//   )
// }
