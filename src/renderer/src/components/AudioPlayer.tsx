import { useCurrentSong } from '../contexts/CurrentSongContext'

const AudioPlayer = ({ children }) => {
  const { audioRef, setCurrentTime, setDuration, setIsPlaying } = useCurrentSong()

  return (
    <>
      {/* Audio */}
      <audio
        autoPlay
        onPlay={() => {
          setIsPlaying(true)
        }}
        onPause={() => {
          setIsPlaying(false)
        }}
        ref={audioRef}
        onTimeUpdate={() => {
          setCurrentTime(() => Math.floor(audioRef.current.currentTime))
        }}
        onLoadedMetadata={() => {
          setDuration(() => audioRef.current.duration)
        }}
      />
      {children}
    </>
  )
}

export default AudioPlayer
