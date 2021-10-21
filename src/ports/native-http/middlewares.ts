import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { ServerResponse } from 'http'
import * as E from 'fp-ts/Either'
import { authMiddleware } from '@/ports/adapters/http/http'
import { httpResponse, IncomingRequest, RequestListener } from './server'

export function auth (request: IncomingRequest) {
  return pipe(
    authMiddleware(request.headers.authorization),
    TE.map((payload) => payload),
    TE.mapLeft(result => result),
  )
}

type WithAuthMiddleware = (handler: RequestListener) => RequestListener
export const withAuth: WithAuthMiddleware = (handler) => {
  return async (request: IncomingRequest, response: ServerResponse) => {
    const payloadOrError = await pipe(
      request,
      auth,
    )()

    pipe(
      payloadOrError,
      E.fold(
        (result) => {
          httpResponse(response, result.error, result.code)
        },
        async (payload) => {
          request.auth = payload
          await handler(request, response)
        }),
    )
  }
}
