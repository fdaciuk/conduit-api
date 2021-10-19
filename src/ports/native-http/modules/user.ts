import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import * as user from '@/ports/adapters/http/modules/user'
import { CreateUser } from '@/core/user/types'

import { Routes, httpResponse } from '../server'

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
}

export { userRoutes }
