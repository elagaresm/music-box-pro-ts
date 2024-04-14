export function getCoverBlob(coverPath: Buffer): string {
  const blob = new Blob([coverPath], { type: 'image/jpeg' })
  return URL.createObjectURL(blob)
}

export function secondsToMinutes(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  if (remainingSeconds < 10) {
    return `${minutes}:0${remainingSeconds}`
  }
  return `${minutes}:${remainingSeconds}`
}

export function matrixOnEvent(headingRef: React.MutableRefObject<HTMLHeadingElement>): void {
  if (!headingRef.current || !headingRef.current.dataset.value) {
    return
  }
  let iterations = 0
  const interval = setInterval(() => {
    const letters = 'abcdefghijklmnopqrstuvwxyz'
    headingRef.current.innerText = headingRef.current.innerText
      .split('')
      .map((letter, index) => {
        if (letter === ' ') {
          return letter
        }
        if (index < iterations) {
          return headingRef.current.dataset.value?.[index] ?? letter
        }
        if (letter.toLowerCase() === letter) {
          return letters[Math.floor(Math.random() * 26)]
        }
        return letters[Math.floor(Math.random() * 26)].toUpperCase()
      })
      .join('')

    if (iterations >= headingRef.current.innerText.length) {
      clearInterval(interval)
    }

    iterations += 1 / 2
  }, 30)
}
