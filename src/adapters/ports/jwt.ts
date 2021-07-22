import * as jwt from '@/ports/jwt/jose'

type JWTPayload = {
  [propName: string]: unknown
}

export const generateToken = (...args: [JWTPayload, string?]) => {
  return jwt.createJWT(...args)
}
