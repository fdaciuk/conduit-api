declare global {
  /* eslint-disable no-unused-vars */
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string
    }
  }
}

export {}
