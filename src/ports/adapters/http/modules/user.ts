import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import { CreateUser, UpdateUser, LoginUser, UserOutput } from '@/core/user/types'
import * as user from '@/core/user/use-cases'
import * as db from '@/ports/adapters/db'
import { getError, extractToken } from '@/ports/adapters/http/http'
import * as jwt from '@/ports/adapters/jwt'

type UserIdAndAuthHeader = {
  id: string
  authHeader?: string
}

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
    TE.mapLeft(getError),
  )
}

export const updateUser = ({ id, authHeader }: UserIdAndAuthHeader) => (data: UpdateUser) => {
  const token = extractToken(authHeader)

  return pipe(
    data,
    user.updateUser(db.updateUserInDB(id)),
    TE.map(user => getUserResponse({ user, token })),
    TE.mapLeft(getError),
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
    TE.mapLeft(getError),
  )
}

export function getCurrentUser ({ id, authHeader }: UserIdAndAuthHeader) {
  const token = extractToken(authHeader)

  return pipe(
    TE.tryCatch(
      () => db.getCurrentUser(id),
      E.toError,
    ),
    TE.map(user => getUserResponse({ user, token })),
    TE.mapLeft(getError),
  )
}

type GetProfileInput = {
  username: string
}

export function getProfile ({ username }: GetProfileInput) {
  return pipe(
    TE.tryCatch(
      () => db.getProfile(username),
      E.toError,
    ),
    TE.map(getProfileResponse),
    TE.mapLeft(getError),
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

const getProfileResponse = (user: db.database.DBUser) => ({
  profile: {
    username: user.username,
    bio: user.bio ?? '',
    image: user.image ?? '',
    following: false,
  },
})
