import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import { CreateUser, LoginUser } from '@/core/user/types'
import * as user from '@/core/user/use-cases/register-user-adapter'
import * as db from '@/ports/adapters/db'
import { getError } from '@/ports/adapters/http/http'

export function registerUser (data: CreateUser) {
  return pipe(
    data,
    user.registerUser(db.createUserInDB),
    TE.mapLeft(error => getError(error.message)),
  )
}

export function login (data: LoginUser) {
  return pipe(
    TE.tryCatch(
      () => db.login(data),
      E.toError,
    ),
    TE.mapLeft(error => getError(error.message)),
  )
}
