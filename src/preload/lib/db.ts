import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import mm from 'music-metadata'

const LIBRARY_PATH = 'C:\\Users\\Enmanuel\\Downloads\\Songs'

export type Artist = {
  name: string
  albums: Album[]
}

export type Album = {
  name: string
  songs?: Song[]
  cover: Buffer | null
  artistName: string
}

export type Song = {
  name: string
  path: string
  artistName: string
  cover: Buffer | null
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

export async function getArtistAll(): Promise<Artist[] | null> {
  try {
    const library = await readLibrary()
    if (library === null) {
      throw new Error('Error reading library')
    }

    const allArtists: Artist[] = []

    for (const artist of library) {
      const artistData = await getArtistByName(artist, { songs: false })

      if (artistData === null) {
        throw new Error(`Couldn't find data from artist: ${artist}`)
      }

      allArtists.push(artistData)
    }

    return allArtists
  } catch (error) {
    console.error('Error loading artist from library.', error)
    return null
  }
}

export async function getArtistByName(
  artistName: string,
  opts: { songs: boolean } = { songs: true }
): Promise<Artist | null> {
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

    const albums: Album[] = []

    for (const album of artistFiles) {
      const albumData = await getAlbumByName(album, artistName, opts)
      if (albumData) {
        albums.push(albumData)
      }
    }
    return { name: artistName, albums }
  } catch (error) {
    console.error(`Error loading artist by name "${artistName}": `, error)
    throw new Error()
  }
}

export async function getAlbumByName(
  albumName: string,
  artistName: string,
  opts: { songs: boolean }
): Promise<Album | null> {
  const albumDirectoryPath = path.join(LIBRARY_PATH, artistName, albumName)

  try {
    if (!(await isDirectory(albumDirectoryPath))) {
      throw new Error(`${albumDirectoryPath} is not a directory`)
    }

    /* Album files */
    const albumFiles = await readdir(albumDirectoryPath)

    /* Cover */
    const cover = await getAlbumCover(albumDirectoryPath, albumFiles)

    /* Return early without songs if opts.song = false */
    if (!opts.songs) {
      return { name: albumName, cover, artistName }
    }

    /* Songs object */
    const songs = getSongsFromAlbum(albumDirectoryPath, albumFiles, artistName, cover)

    return { name: albumName, songs, cover, artistName }
  } catch (err) {
    console.error(err)
    return null
  }
}

function getSongsFromAlbum(
  albumDirectoryPath: string,
  files: string[],
  artistName: string,
  cover: Buffer | null
): Song[] {
  const songs = files
    .filter((file: string) => file.endsWith('.mp3'))
    .map((song) => {
      const songPath = path.join(albumDirectoryPath, song)
      return { name: getFileNameWithoutExtension(song), path: songPath, artistName, cover }
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
  if (filename.indexOf('/') !== -1 || filename.indexOf('\\') !== -1) {
    const pathSeparator = filename.indexOf('/') !== -1 ? '/' : '\\'
    const basename = filename.split(pathSeparator).pop()
    return basename!.split('.').slice(0, -1).join('.')
  }
  return filename.split('.').slice(0, -1).join('.')
}
