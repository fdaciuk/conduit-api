import { verifyToken } from '@/ports/adapters/jwt'

export * from '@/ports/fastify/server'

export function getError (errors: string) {
  return {
    errors: {
      body: errors.split(':::'),
    },
  }
}

export function getToken (authorizationHeader: string = '') {
  const token = authorizationHeader.replace('Token ', '')
  return verifyToken(token)
}
