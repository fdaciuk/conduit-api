import { verifyToken } from '@/ports/adapters/jwt'

export * from '@/ports/fastify/server'

export function getError (errors: string) {
  return {
    errors: {
      body: errors.split(':::'),
    },
  }
}

export function getToken (authHeader: string = '') {
  const token = extractToken(authHeader)
  return verifyToken(token)
}

export function extractToken (authHeader: string = '') {
  return authHeader.replace('Token ', '')
}
