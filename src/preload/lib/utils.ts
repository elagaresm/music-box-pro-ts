import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import mm from 'music-metadata'

const LIBRARY_PATH = 'C:\\Users\\Enmanuel\\Downloads\\Songs'

type Artist = {
  name: string
  path: string
}

type Cover = Buffer | null

type Song = {
  name: string
  path: string
  artist: Artist
  cover: Cover
}

export type Album = {
  songs: Song[]
  cover: Cover
  artist: Artist
}

export type ArtistsWithAlbumCount = {
  artist: string
  albumsCount: number
  covers: Buffer[] | null
}

export type ArtistByName = {
  [key: string]: {
    songs: Song[]
    cover: Buffer | null
    artist: {
      name: string
      path: string
    }
  }
}

async function readLibrary(): Promise<string[] | null> {
  try {
    if (!(await isDirectory(LIBRARY_PATH))) {
      throw new Error('Library path does not exist or is not a directory')
    }
    return await readdir(LIBRARY_PATH)
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getAllArtistsWithAlbumCount(): Promise<ArtistsWithAlbumCount[] | null> {
  try {
    const library = await readLibrary()
    if (library === null) {
      throw new Error('Error reading library')
    }

    const allArtists: ArtistsWithAlbumCount[] = []

    for (const artist of library) {
      const artistDirectoryPath = path.join(LIBRARY_PATH, artist)

      if (!(await isDirectory(artistDirectoryPath))) {
        throw new Error('Path is not a directory')
      }

      const artistData = { artist, albumsCount: 0, covers: null } as {
        artist: string
        albumsCount: number
        covers: Buffer[] | null
      }

      const artistFiles = await readdir(artistDirectoryPath)

      const albumCovers: Buffer[] = []

      for (const album of artistFiles) {
        const albumDirectoryPath = path.join(artistDirectoryPath, album)
        if (!(await isDirectory(albumDirectoryPath))) {
          throw new Error(`${albumDirectoryPath} is not a directory inside of ${artist} directory`)
        }
        artistData.albumsCount++
        const cover = await getAlbumCover(albumDirectoryPath)
        if (cover === null) {
          continue
        } else if (albumCovers.length < 4) {
          albumCovers.push(cover)
        }
      }

      artistData.covers = albumCovers.length ? albumCovers : null

      allArtists.push(artistData)
    }

    return allArtists
  } catch (error) {
    console.error('Error loading all artists with album count: ', error)
    return null
  }
}

export async function getArtistByName(artistName: string): Promise<ArtistByName | null> {
  try {
    const library = await readLibrary()
    if (library === null) {
      throw new Error('Error reading library')
    }

    const artist = library.find((dir) => dir.toLowerCase() === artistName.toLowerCase())

    if (!artist) {
      return null
    }

    const artistDirectoryPath = path.join(LIBRARY_PATH, artist)

    if (!(await isDirectory(artistDirectoryPath))) {
      throw new Error('Path is not a directory')
    }

    const artistFiles = await readdir(artistDirectoryPath)

    const albums: ArtistByName = {}

    for (const album of artistFiles) {
      const albumDirectoryPath = path.join(artistDirectoryPath, album)
      const albumData = await fetchAlbum(albumDirectoryPath, artistName)
      if (albumData) {
        albums[album] = albumData
      }
    }

    return albums
  } catch (error) {
    console.error(`Error loading artist by name "${artistName}": `, error)
    throw new Error()
  }
}

export async function fetchAlbum(
  albumDirectoryPath: string,
  artistName: string
): Promise<Album | null> {
  try {
    if (!(await isDirectory(albumDirectoryPath))) {
      throw new Error(`${albumDirectoryPath} is not a directory`)
    }

    /* Album files */
    const albumFiles = await readdir(albumDirectoryPath)

    /* Artist info */
    const artistDirectoryPath = path.join(LIBRARY_PATH, artistName)
    const artist = { name: artistName, path: artistDirectoryPath }

    /* Cover */
    const cover = await getAlbumCover(albumDirectoryPath, albumFiles)

    /* Songs object */
    const songs = getSongsFromAlbum(albumFiles, albumDirectoryPath, artist, cover)

    return { songs, cover, artist }
  } catch (err) {
    console.error(err)
    return null
  }
}

type SongsFromAlbum = {
  name: string
  path: string
  artist: Artist
  cover: Cover
}

function getSongsFromAlbum(
  files: string[],
  albumDirectoryPath: string,
  artist: { name: string; path: string },
  cover: Buffer | null
): SongsFromAlbum[] {
  const songs = files
    .filter((file: string) => file.endsWith('.mp3'))
    .map((song) => {
      const songPath = path.join(albumDirectoryPath, song)
      return { name: getFileNameWithoutExtension(song), path: songPath, artist, cover }
    })

  return songs
}

export async function getSongDuration(path: string): Promise<number | null> {
  try {
    const metadata = await mm.parseFile(path, { duration: true, skipCovers: true })
    const { duration } = metadata.format
    if (duration === undefined) {
      throw new Error('duration is undefined')
    }
    return duration
  } catch (error) {
    console.error('Error getting song metadata: ', error)
    return null
  }
}

async function getAlbumCover(albumDirectoryPath: string, files?: string[]): Promise<Buffer | null> {
  if (!files) {
    try {
      files = await readdir(albumDirectoryPath)
    } catch (error) {
      console.error(`Error reading album directory ${albumDirectoryPath}: `, error)
      return null
    }
  }

  const coverSupportedExtensions = ['.jpg', '.jpeg', '.png', '.webp']

  const cover = files.find((file) => coverSupportedExtensions.includes(path.extname(file)))

  if (!cover) {
    console.error(`No cover image found in ${albumDirectoryPath}`)
    return null
  }

  const coverPath = path.join(albumDirectoryPath, cover)

  try {
    return await getDataFromFile(coverPath)
  } catch {
    console.error(`Error reading cover image ${coverPath}`)
    return null
  }
}

export async function getDataFromFile(filePath: string): Promise<Buffer> {
  try {
    return await readFile(filePath)
  } catch (error) {
    console.error(`Error getting file data from ${filePath}: `, error)
    throw Error
  }
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path)
    return stats.isDirectory()
  } catch (error) {
    console.error(`Error checking directory ${path}:`, error)
    throw Error
  }
}

function getFileNameWithoutExtension(filename: string): string {
  if (filename.indexOf('/') !== -1) {
    const basename = filename.split('/')[-1]
    return basename.split('.').slice(0, -1).join('.')
  }
  return filename.split('.').slice(0, -1).join('.')
}
