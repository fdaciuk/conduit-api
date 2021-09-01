import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import { CreateUser, LoginUser, UserOutput } from '@/core/user/types'
import { AuthorId } from '@/core/article/types'
import * as user from '@/core/user/use-cases/register-user-adapter'
import * as db from '@/ports/adapters/db'
import { getError, extractToken } from '@/ports/adapters/http/http'
import * as jwt from '@/ports/adapters/jwt'

export function registerUser (data: CreateUser) {
  return pipe(
    data,
    user.registerUser(db.createUserInDB),
    TE.chain(user => pipe(
      TE.tryCatch(
        () => jwt.generateToken({ id: user.id }),
        E.toError,
      ),
      TE.map(token => ({ user, token })),
    )),
    TE.map(getUserResponse),
    TE.mapLeft(error => getError(error.message)),
  )
}

export function login (data: LoginUser) {
  return pipe(
    TE.tryCatch(
      () => db.login(data),
      E.toError,
    ),
    TE.chain((user) => pipe(
      TE.tryCatch(
        () => jwt.generateToken({ id: user.id }),
        E.toError,
      ),
      TE.map(token => ({ user, token })),
    )),
    TE.map(getUserResponse),
    TE.mapLeft(error => getError(error.message)),
  )
}

type GetCurrentUserInput = {
  payload: jwt.JWTPayload
  authHeader?: string
}

export function getCurrentUser ({ payload, authHeader }: GetCurrentUserInput) {
  const propId = 'id'
  // TODO: Tentar remover o type assertion
  const userId = payload[propId] as AuthorId
  const token = extractToken(authHeader)

  return pipe(
    TE.tryCatch(
      () => db.getCurrentUser(userId),
      E.toError,
    ),
    TE.map(user => getUserResponse({ user, token })),
    TE.mapLeft(error => getError(error.message)),
  )
}

type GetUserResponseInput = {
  user: db.database.DBUser
  token: string
}

type UserResponse = {
  user: UserOutput
}

type GetUserResponse = (input: GetUserResponseInput) => UserResponse

const getUserResponse: GetUserResponse = ({ user, token }) => ({
  user: {
    email: user.email,
    token: token,
    username: user.username,
    bio: user.bio ?? '',
    image: user.image ?? '',
  },
})
