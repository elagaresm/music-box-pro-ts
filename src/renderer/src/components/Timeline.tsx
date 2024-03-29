const [progressValue, setProgressValue] = useState<number>(0);
  const [playState, setPlayState] = useState<boolean>(false)


useEffect(() => {
    let interval: any;

    const startProgress = () => {
        interval = setInterval(() => {
            setProgressValue((prevValue) => {
            const newValue = ((prevValue / 100 * 30) + 0.025);

            // Stop the timer when progress reaches 30
            if (newValue >= 30) {
              clearInterval(interval);
              // play next song
              if (currentTrackIndex+1 > previewUrls.length) {
                playTrack(0)
              } else {
                playTrack(currentTrackIndex+1)
              }
            }

            return (newValue / 30) * 100;
          });
        }, 25);
      };
  // Start or stop the progress timer based on playState state
      if (playState) {
        startProgress();
      } else {
        clearInterval(interval);
      }

      return () => clearInterval(interval);
  },[playState,setProgressValue])
