import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import * as user from '@/ports/adapters/http/modules/user'
import { CreateUser } from '@/core/user/types'
import { getPayload } from '@/ports/adapters/http/http'
import { Routes, httpResponse } from '../server'
import { withAuth } from '../middlewares'

type GetUserFromRequestBody = (data: string) => CreateUser
const getUserFromRequestBody: GetUserFromRequestBody = (data) => {
  const { user } = pipe(
    E.tryCatch(
      () => JSON.parse(data),
      E.toError,
    ),
    E.fold(
      (error) => error,
      (user) => user,
    ),
  )

  return user || {}
}

const userRoutes: Routes = {
  'GET /api/user': withAuth(async (request, response) => {
    const payload = getPayload(request.auth)

    pipe(
      user.getCurrentUser({
        id: payload.id,
        authHeader: request.headers.authorization,
      }),
      TE.map(result => httpResponse(response, result)),
      TE.mapLeft(result => httpResponse(response, result.error, result.code)),
    )()
  }),

  'POST /api/users': async (request, response) => {
    for await (const body of request) {
      pipe(
        body,
        getUserFromRequestBody,
        user.registerUser,
        TE.map(result => httpResponse(response, result)),
        TE.mapLeft(result => httpResponse(response, result.error, result.code)),
      )()
    }
  },

  'POST /api/users/login': async (request, response) => {
    for await (const body of request) {
      pipe(
        body,
        getUserFromRequestBody,
        user.login,
        TE.map(result => httpResponse(response, result)),
        TE.mapLeft(result => httpResponse(response, result.error, result.code)),
      )()
    }
  },

  'PUT /api/user': withAuth(async (request, response) => {
    const payload = getPayload(request.auth)

    for await (const body of request) {
      pipe(
        body,
        getUserFromRequestBody,
        user.updateUser({
          id: payload.id,
          authHeader: request.headers.authorization,
        }),
        TE.map(result => httpResponse(response, result)),
        TE.mapLeft(result => httpResponse(response, result.error, result.code)),
      )()
    }
  }),
}

export { userRoutes }
