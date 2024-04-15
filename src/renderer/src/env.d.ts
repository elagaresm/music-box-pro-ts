/// <reference types="vite/client" />
import { Album, Artist, Song } from '../../preload/lib/db'

declare global {
  interface Window {
    api: {
      getArtistAll: () => Promise<Artist[] | null>
      getArtistByName: (artistName: string) => Promise<Artist | null>
      getAlbumByName: (
        artistName: string,
        albumName: string,
        opts = { songs: boolean }
      ) => Promise<Album | null>
      getSongDuration: (songPath: string) => Promise<number | null>
    }
  }
}

export { Album, Artist, Song }
