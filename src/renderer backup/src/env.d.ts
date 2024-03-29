/// <reference types="vite/client" />

declare global {
  interface Window {
    api: {
      openSong: () => Promise<any>
    }
  }
}

export {}
