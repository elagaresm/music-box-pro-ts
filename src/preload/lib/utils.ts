import fs from 'node:fs/promises'
import path from 'node:path'
import mm from 'music-metadata'

const LIBRARY_PATH = 'C:\\Users\\Enmanuel\\Downloads\\Songs'

export type Song = {
  name: string
  path: string
  artist: string
  coverPath: string | null
}

export async function loadSongs() {
  try {
    const artists = await readLibraryPath()
    const result = []

    if (artists === undefined) {
      throw new Error()
    }
    for (const artist of artists) {
      result.push(await getArtistByName(artist))
    }
    return result
  } catch (err) {
    console.error('Unable to scan directory: ', err)
    return null
  }
}

async function readLibraryPath() {
  if (!(await isDirectory(LIBRARY_PATH))) {
    console.log('Library path does not exist or is not a directory.')
    return
  }

  return await fs.readdir(LIBRARY_PATH)
}

export async function getArtistByName(artistName: string): Promise<Song> {
  try {
    const library = await readLibraryPath()
    if (library === undefined) {
      throw new Error('library is undefined')
    }
    const artist = library.find((dir) => dir === artistName)

    if (!artist) {
      throw new Error('Artist not found')
    }

    const artistDirectoryPath = path.join(LIBRARY_PATH, artist)

    if (!(await isDirectory(artistDirectoryPath))) {
      throw new Error('Path is not a directory')
    }

    const files = await fs.readdir(artistDirectoryPath)

    const coverPath = getCoverPath(files, artistDirectoryPath)
    let cover: Buffer | null = null
    if (coverPath !== null) {
      cover = await fs.readFile(coverPath)
    }
    const songs = getSongs(files, artistDirectoryPath, artist)

    return {
      artist: { name: artistName, path: artistDirectoryPath },
      cover: await fs.readFile(coverPath),
      songs
    }
  } catch (error) {
    console.log(`Error loading artist by name "${artistName}": `, error)
  }
}

/**
 * Filters a list of file names for songs (`.mp3` files) and constructs an array of song objects
 * with metadata including the song's name, path, artist name, and cover path. It assumes that
 * all songs belong to the specified artist and that the cover image's path applies to all songs.
 *
 * @param {string[]} files An array of file names to be filtered and processed as songs.
 * @param {string} artistDirectoryPath The directory path where the artist's songs are stored.
 * @param {string} artistName The name of the artist to whom the songs belong.
 * @returns {Object[]} An array of objects, each representing a song with properties: `name` (the song's name without the `.mp3` extension),
 * `path` (the full path to the song file), `artist` (the artist's name), and `coverPath` (the path to the song's cover image).
 */
function getSongs(files: string[], artistDirectoryPath: string, artistName: string): Song[] {
  const coverPath = getCoverPath(files, artistDirectoryPath)
  const songs = files
    .filter((file: string) => file.endsWith('.mp3'))
    .map((song) => {
      const songPath = path.join(artistDirectoryPath, song)
      return {
        name: getFileNameWithoutExtension(song),
        path: songPath,
        artist: artistName,
        coverPath
      }
    })
  return songs
}

/**
 * Asynchronously retrieves the duration of a song file.
 *
 * This function attempts to read and parse the metadata of a song file specified by the `path` parameter.
 * It specifically looks for the duration of the song within the file's metadata. If the duration is found,
 * it is returned. If the duration cannot be determined or if any error occurs during the process, the function
 * returns null.
 *
 * @param {string} path The path to the song file from which to retrieve the duration.
 * @returns {Promise<number | null>} A Promise that resolves to the duration of the song in seconds as a number
 * if the duration is successfully retrieved. If the duration is undefined or if an error occurs, the Promise resolves to null.
 */
export async function getSongDuration(path: string): Promise<number | null> {
  try {
    const metadata = await mm.parseFile(path, { duration: true, skipCovers: true })
    const { duration } = metadata.format
    if (duration === undefined) {
      throw new Error('duration is undefined')
    }
    return duration
  } catch (error) {
    console.error('Error getting song metadata:', error)
    return null
  }
}

/**
 * Asynchronously reads the entire contents of a file.
 *
 * @param {string} filePath The path to the file to be read.
 * @returns {Promise<Buffer | null>} A Promise that resolves to a Buffer containing the file's data if the file is successfully read. If an error occurs during reading the file, the Promise resolves to null.
 */
export async function getDataFromFile(filePath: string): Promise<Buffer | null> {
  try {
    const data = await fs.readFile(filePath)
    return data
  } catch (error) {
    console.error('Error getting file data: ', error)
    return null
  }
}

/**
 * Searches through a list of file names to find a cover image based on supported extensions.
 * The function returns the full path to the cover image if one is found, or null if no matching
 * file is found. Supported image extensions are .jpg, .jpeg, .png, and .webp.
 *
 * @param {string[]} files - An array of file names to search for a cover image.
 * @param {string} artistDirectoryPath - The directory path where the files are located. This path
 *                                       is used to construct the full path to the cover image.
 * @returns {null | string} The full path to the cover image if found; otherwise, null.
 *
 * @example
 * // Assuming the directory "/music/artist" contains "album.jpg", "track.mp3"...
 * const coverPath = getCoverPath(["album.jpg", "track.mp3"], "/music/artist");
 * console.log(coverPath); // Outputs: "/music/artist/album.jpg"
 */
function getCoverPath(files: string[], artistDirectoryPath: string): null | string {
  const coverSupportedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  const cover = files.find((file) => coverSupportedExtensions.includes(path.extname(file)))
  const coverPath = cover ? path.join(artistDirectoryPath, cover) : null
  return coverPath
}

/**
 * Asynchronously checks if the given path is a directory.
 * The function attempts to get file system statistics for the specified path and then
 * determines if the path is a directory based on those stats. If the path does not exist
 * or any error occurs during the check, it logs the error and returns false.
 *
 * @param {string} path - The file system path to check if it is a directory.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the path is a directory,
 *                             and `false` otherwise.
 *
 * @example
 * async function checkDirectory() {
 *   const path = "./data";
 *   const isDir = await isDirectory(path);
 *   console.log(`${path} is a directory: ${isDir}`);
 * }
 * checkDirectory();
 */
async function isDirectory(path: string): Promise<boolean> {
  try {
    const stat = await fs.stat(path)
    return stat.isDirectory()
  } catch (error) {
    console.error('Error checking directory:', error)
    return false
  }
}

/**
 * Extracts the file name without its extension from a given filename string.
 * If the filename includes a path (detected by the presence of '/'), the function
 * first extracts the basename (the part after the last '/'). Then, it removes the
 * file extension, if any. The file extension is considered to be the part after the
 * last '.' in the basename. If there's no '.' in the basename, the function returns
 * the basename itself. This function handles filenames with multiple periods correctly,
 * treating only the last segment as the extension.
 *
 * @param {string} filename - The filename from which to extract the name without extension,
 *                            possibly including a path.
 * @returns {string} The filename without its extension. If the file has no extension,
 *                   returns the filename unchanged.
 *
 * @example
 * console.log(getFileNameWithoutExtension("path/to/myfile.txt")); // Outputs: "myfile"
 * console.log(getFileNameWithoutExtension("anotherfile")); // Outputs: "anotherfile"
 * console.log(getFileNameWithoutExtension("my.file.with.many.dots.ext")); // Outputs: "my.file.with.many.dots"
 */
function getFileNameWithoutExtension(filename: string): string {
  if (filename.indexOf('/') !== -1) {
    const basename = filename.split('/')[-1]
    return basename.split('.').slice(0, -1).join('.')
  }
  return filename.split('.').slice(0, -1).join('.')
}
