import * as jwt from '@/ports/jwt/jose'

export type JWTPayload = { [id: string]: unknown }

type ExpirationTime = string

export const generateToken = (...args: [JWTPayload, ExpirationTime?]) => {
  return jwt.createJWT(...args)
}

export const verifyToken = async (token: string) => {
  const { payload } = await jwt.verifyJWT(token)
  return payload
}
