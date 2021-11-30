import { jwt } from './provider'
import { AuthorId, AuthorIdOutput } from '@/core/profile/types'
import { ValidationError } from '@/helpers/errors'

export type JWTPayload = {
  id: AuthorId
}

export type JWTPayloadInput = {
  id: AuthorIdOutput
}

type ExpirationTime = string

export const generateToken = (...args: [JWTPayloadInput, ExpirationTime?]) => {
  return jwt.createJWT(...args)
}

export const verifyToken = async (token: string) => {
  const { payload } = await jwt.verifyJWT(token)

  if (isValidPayload(payload)) {
    return payload
  }

  throw new ValidationError('Invalid payload. User ID is missing')
}

function isValidPayload (payload: unknown): payload is JWTPayload {
  return isObject(payload) && 'id' in payload
}

function isObject (value: unknown): value is object {
  return Object.prototype.toString.call(value) === '[object Object]'
}
