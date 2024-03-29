/// <reference types="vite/client" />
import { ArtistsWithAlbumCount, ArtistByName } from '../../preload/lib/utils'

declare global {
  interface Window {
    api: {
      getAllArtistsWithAlbumCount: () => Promise<ArtistsWithAlbumCount | null>
      getArtistByName: (artistName: string) => Promise<ArtistByName | null>
    }
  }
}

export { ArtistsWithAlbumCount, ArtistByName }
