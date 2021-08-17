export * from '@/ports/fastify/server'

export function getError (errors: string) {
  return {
    errors: {
      body: errors.split(':::'),
    },
  }
}
