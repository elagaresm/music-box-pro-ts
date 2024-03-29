export async function loader() {
  try {
    const data = await window.api.loadSongs()
  } catch (error) {
    console.error(err)
  }
}

function App(): JSX.Element {
  return <>Hello world</>
}

export default App
