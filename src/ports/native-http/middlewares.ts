import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { ServerResponse } from 'http'
import { authMiddleware } from '@/ports/adapters/http/http'
import { httpResponse, IncomingRequest, RequestListener } from './server'

type WithAuthMiddleware = (handler: RequestListener) => RequestListener
export const withAuth: WithAuthMiddleware = (handler) => {
  return async (request: IncomingRequest, response: ServerResponse) => {
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
