declare global {
  /* eslint-disable no-unused-vars */
  namespace NodeJS {
    interface ProcessEnv {
      CUSTOM_ENV: string
    }
  }
}

export {}
