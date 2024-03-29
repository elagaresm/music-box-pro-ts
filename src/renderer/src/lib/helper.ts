export function getCoverBlob(coverPath: Buffer) {
  const blob = new Blob([coverPath], { type: 'image/jpeg' })
  return URL.createObjectURL(blob)
}

export function secondsToMinutes(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  if (remainingSeconds < 10) {
    return `${minutes}:0${remainingSeconds}`
  }
  return `${minutes}:${remainingSeconds}`
}

export function matrixOnEvent(event) {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  let iterations = 0
  const interval = setInterval(() => {
    event.target.innerText = event.target.innerText
      .split('')
      .map((letter, index) => {
        if (index < iterations) {
          return event.target.dataset.value[index]
        }
        if (letter.toLowerCase() === letter) {
          return letters[Math.floor(Math.random() * 26)]
        }
        return letters[Math.floor(Math.random() * 26)].toUpperCase()
      })
      .join('')

    if (iterations >= event.target.innerText.length) {
      clearInterval(interval)
    }

    iterations += 1 / 3
  }, 30)
}
