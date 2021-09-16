import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import { verifyToken, JWTPayload } from '@/ports/adapters/jwt'
import { DefaultError, AuthError } from '@/helpers/errors'

export function getError <E extends Error> (error: E) {
  const COMMON_ERROR_CODE = 400

  return {
    code: error instanceof DefaultError ? error.code : COMMON_ERROR_CODE,
    error: {
      errors: {
        body: error.message.split(':::'),
      },
    },
  }
}

export function extractToken (authHeader: string = '') {
  return authHeader.replace('Token ', '')
}

export function authMiddleware (authHeader: string = '') {
  const token = extractToken(authHeader)

  return pipe(
    TE.tryCatch(
      () => verifyToken(token),
      E.toError,
    ),
    TE.mapLeft(() => getError(new AuthError())),
  )
}

export function getPayload (payload?: JWTPayload) {
  return payload ?? { id: '' }
}
