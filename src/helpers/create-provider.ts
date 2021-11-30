type ProviderModule<T> = {
  provider: T | null
  getProvider (): T
}

type ProviderConfig<T> = {
  name: string
  port: (providerName: string) => Promise<T>
}

type Setup = (providerName: string) => Promise<void>

export const createProvider = <T>(config: ProviderConfig<T>): [Setup, ProviderModule<T>] => {
  const providerModule: ProviderModule<T> = {
    provider: null,
    getProvider () {
      if (this.provider === null) {
        throw new Error(`${config.name} provider is not setup`)
      }
      return this.provider
    },
  }

  const setup: Setup = async (providerName) => {
    const provider = await config.port(providerName)
    providerModule.provider = provider
  }

  return [setup, providerModule]
}
