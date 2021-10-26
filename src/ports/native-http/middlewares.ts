import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { authMiddleware } from '@/ports/adapters/http/http'
import { httpResponse, RequestListener } from './server'

type WithAuthMiddleware = (handler: RequestListener) => RequestListener
export const withAuth: WithAuthMiddleware = (handler) => {
  return async (request, response) => {
    pipe(
      authMiddleware(request.headers.authorization),
      TE.map(
        async (payload) => {
          request.auth = payload
          await handler(request, response)
        },
      ),
      TE.mapLeft(
        (result) => httpResponse(response, result.error, result.code),
      ),
    )()
  }
}

export const withTryAuth: WithAuthMiddleware = (handler) => {
  return async (request, response) => {
    pipe(
      authMiddleware(request.headers.authorization),
      TE.map(
        async (payload) => {
          request.auth = payload
          await handler(request, response)
        },
      ),
      TE.mapLeft(
        async () => {
          request.auth = undefined
          await handler(request, response)
        },
      ),
    )()
  }
}
