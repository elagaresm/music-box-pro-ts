import { Link, useLoaderData, useLocation } from 'react-router-dom'
import { getCoverBlob } from '../lib/helper'
import { Artist, Album } from '@renderer/env'
import ThumbnailFallback from '../assets/thumbnail-fallback.webp'
import Collage from './components/Collage'

export async function loader(): Promise<Artist[] | null> {
  try {
    const artists = await window.api.getArtistAll()
    if (artists === null) {
      throw new Error('Error loading artists')
    }
    return artists
  } catch (err) {
    console.error(err)
    return null
  }
}

const Artists = (): JSX.Element => {
  /* Print current location */
  /* const location = useLocation()
  console.log('path: ', location.pathname) */

  const data = useLoaderData() as Artist[]

  if (data && data.length > 0) {
    return (
      <ArtistGrid>
        {data.map((artist) => {
          console.log('artist:', artist)
          return (
            <Link to={`/artist/${artist.name}`} key={artist.name}>
              <ArtistThumbnail artist={artist} />
            </Link>
          )
        })}
      </ArtistGrid>
    )
  }

  return (
    <div id="main" style={{ gridArea: 'main' }} className="rounded">
      <h1>Loading...</h1>
    </div>
  )
}

export default Artists

function ArtistGrid({ children }: { children: JSX.Element[] }): JSX.Element {
  return (
    <div className="rounded overflow-y-auto p-4 grid auto-rows-[195px] grid-cols-3 gap-[20px]">
      {children}
    </div>
  )
}

function ArtistThumbnail({ artist }: { artist: Artist }): JSX.Element {
  const { name, albums } = artist

  const covers = albums.map((album: Album) => album.cover)

  const largeText = name.length > 12

  if (covers === null) {
    return (
      <div className="p-2 bg-[#151515] rounded-lg flex basis-32 flex-col items-center hover:scale-110 duration-500 ease-in-out cursor-pointer">
        <img
          src={ThumbnailFallback}
          alt="artist thumbnail"
          className="w-full rounded aspect-square"
        />
        <div className="w-full overflow-hidden flex flex-col items-center">
          <p
            className={`${largeText && 'moving-text'} text-white text-center text-base whitespace-nowrap w-full mt-2 mb-1`}
          >
            {name}
          </p>
        </div>
      </div>
    )
  }

  const coversData: string[] | JSX.Element = []

  for (const cover of covers) {
    if (cover === null) {
      continue
    }
    coversData.push(getCoverBlob(cover))
  }

  return (
    <div className="p-2 bg-[#151515] rounded-lg flex basis-32 flex-col items-center hover:scale-110 duration-500 ease-in-out cursor-pointer">
      <Collage images={coversData} />
      <div className="w-full overflow-hidden flex flex-col items-center">
        <p
          className={`${largeText && 'moving-text'} text-white text-center text-base whitespace-nowrap w-full mt-2 mb-1`}
        >
          {name}
        </p>
      </div>
    </div>
  )
}
