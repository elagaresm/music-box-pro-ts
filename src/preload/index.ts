import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  Album,
  Artist,
  getAlbumByName,
  getArtistAll,
  getArtistByName,
  getSongDuration
} from './lib/db'

// Custom APIs for renderer
const api = {
  getArtistAll: (): Promise<Artist[] | null> => getArtistAll(),
  getArtistByName: (artistName: string): Promise<Artist | null> => getArtistByName(artistName),
  getAlbumByName: (
    albumName: string,
    artistName: string,
    opts: { songs: boolean }
  ): Promise<Album | null> => getAlbumByName(albumName, artistName, opts),
  getSongDuration: (songPath: string): Promise<number | null> => getSongDuration(songPath)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
