import { Link, useLoaderData, useLocation } from 'react-router-dom'
import { getCoverBlob } from '../lib/helper'
import { ArtistsWithAlbumCount } from '@renderer/env'
import ThumbnailFallback from '../assets/thumbnail-fallback.webp'
import Collage from './components/Collage'

export async function loader(): Promise<ArtistsWithAlbumCount | null> {
  try {
    const artists = await window.api.getAllArtistsWithAlbumCount()
    console.log(artists)
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
  const location = useLocation()
  console.log('path: ', location.pathname)

  const loaderData = useLoaderData() as ArtistsWithAlbumCount[]

  if (loaderData && loaderData.length > 0) {
    return (
      <ArtistGrid>
        {loaderData.map((artist) => {
          return (
            <Link to={`/artist/${artist.artist}`} key={artist.artist}>
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

function ArtistThumbnail({ artist }: { artist: ArtistsWithAlbumCount }): JSX.Element {
  const { artist: name, covers, albumsCount } = artist

  if (covers === null) {
    return (
      <div className="p-2 bg-[#151515] rounded-lg flex basis-32 flex-col items-center hover:scale-110 duration-500 ease-in-out cursor-pointer">
        <img
          src={ThumbnailFallback}
          alt="artist thumbnail"
          className="w-full rounded aspect-square"
        />
        <div className="w-full overflow-hidden flex flex-col items-center">
          <p className="text-white text-center text-base whitespace-nowrap w-full">{name}</p>
          <p className="text-outline text-xs">{albumsCount} albums</p>
        </div>
      </div>
    )
  }

  const coversData: string[] | JSX.Element = []

  for (const cover of covers) {
    coversData.push(getCoverBlob(cover))
  }

  const largeText = name.length > 12

  return (
    <div className="p-2 bg-[#151515] rounded-lg flex basis-32 flex-col items-center hover:scale-110 duration-500 ease-in-out cursor-pointer">
      {coversData.length === 1 ? (
        <img src={coversData[0]} alt="artist thumbnail" className="w-full rounded aspect-square" />
      ) : (
        <Collage images={coversData} />
      )}
      <div className="w-full overflow-hidden flex flex-col items-center">
        <p
          className={`${largeText && 'moving-text'} text-white text-center text-base whitespace-nowrap w-full`}
        >
          {name}
        </p>
        <p className="text-outline text-xs">{albumsCount} albums</p>
      </div>
    </div>
  )
}
