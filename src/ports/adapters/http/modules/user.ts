import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import { CreateUser, LoginUser } from '@/core/user/types'
import { AuthorId } from '@/core/article/types'
import * as user from '@/core/user/use-cases/register-user-adapter'
import * as db from '@/ports/adapters/db'
import { getError, extractToken } from '@/ports/adapters/http/http'
import { JWTPayload } from '@/ports/adapters/jwt'

// TODO: Trazer a criação do token e retorno dos dados da forma que a API
// espera para esse adapter (hoje está no adapter de banco)

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

type GetCurrentUserInput = {
  payload: JWTPayload
  authHeader?: string
}

export function getCurrentUser ({ payload, authHeader }: GetCurrentUserInput) {
  const propId = 'id'
  const userId = payload[propId] as AuthorId

  return pipe(
    TE.tryCatch(
      () => db.getCurrentUser(userId),
      E.toError,
    ),
    TE.map(user => ({
      user: {
        email: user.email,
        token: extractToken(authHeader),
        username: user.username,
        bio: user.bio ?? '',
        image: user.image ?? '',
      },
    })),
    TE.mapLeft(error => getError(error.message)),
  )
}
