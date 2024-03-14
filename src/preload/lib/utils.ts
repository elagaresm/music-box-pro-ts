import fs from 'node:fs/promises'
import path from 'node:path'
import mm from 'music-metadata'

const LIBRARY_PATH = 'C:\\Users\\Enmanuel\\Downloads\\Songs'

export async function loadSongs() {
  try {
    const artists = await readLibraryPath()
    const result = []

    for (const artist of artists) {
      result.push(await getArtistByName(artist))
    }
    return result
  } catch (err) {
    console.error('Unable to scan directory: ', err)
  }
}

async function readLibraryPath() {
  if (!(await isDirectory(LIBRARY_PATH))) {
    console.log('Library path does not exist or is not a directory.')
    return
  }

  return await fs.readdir(LIBRARY_PATH)
}

export async function getArtistByName(artistName) {
  try {
    const library = await readLibraryPath()
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

function getSongs(files, artistDirectoryPath, artistName) {
  const coverPath = getCoverPath(files, artistDirectoryPath)
  const songs = files
    .filter((file) => file.endsWith('.mp3'))
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

export async function getSongDuration(songPath) {
  try {
    const metadata = await mm.parseFile(songPath, { duration: true, skipCovers: true })
    const duration = metadata.format.duration
    return duration
  } catch (error) {
    console.error('Error getting song metadata:', error)
  }
}

export async function getSongData(songPath) {
  try {
    const data = await fs.readFile(songPath)
    return data
  } catch (error) {
    console.error('Error getting song data:', error)
  }
}

export async function getCoverData(coverPath) {
  try {
    const data = await fs.readFile(coverPath)
    return data
  } catch (error) {
    console.error('Error getting song data:', error)
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
function gcwetFileNameWithoutExtension(filename: string): string {
  if (filename.indexOf('/') !== -1) {
    const basename = filename.split('/')[-1]
    return basename.split('.').slice(0, -1).join('.')
  }
  return filename.split('.').slice(0, -1).join('.')
}
