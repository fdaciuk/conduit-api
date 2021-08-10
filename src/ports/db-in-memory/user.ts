import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import argon2 from 'argon2'
import { v4 as uuidv4 } from 'uuid'
import { CreateUser, LoginUser } from '@/core/user/types'
import { DBUser, db } from './db'

type CreateUserInDB = (data: CreateUser) => Promise<DBUser>

export const createUserInDB: CreateUserInDB = async (data) => {
  if (db.usersByEmail[data.email]) {
    throw new Error('User already registered')
  }

  const hash = await argon2.hash(data.password)

  const id = uuidv4()

  db.usersByEmail[data.email] = id

  const user = db.users[id] = {
    id,
    email: data.email,
    username: data.username,
    password: hash,
  }

  return user
}

type Login = (data: LoginUser) => TE.TaskEither<Error, DBUser>
export const login: Login = (data) => {
  return pipe(
    O.fromNullable(db.usersByEmail[data.email]),
    O.chain(userId => O.fromNullable(db.users[userId])),
    E.fromOption(() => new Error('User not found')),
    TE.fromEither,
    TE.chain(user =>
      TE.tryCatch(
        async () => {
          if (!(await argon2.verify(user.password, data.password))) {
            throw new Error('Invalid email or password')
          }

          return user
        },
        E.toError,
      ),
    ),
  )
}
