import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { CreateUser, UpdateUser, LoginUser } from '@/core/user/types'
import { getPayload } from '@/ports/adapters/http/http'
import * as user from '@/ports/adapters/http/modules/user'
import { app, authOptions } from '../server'

type CreateUserApi = {
  Body: {
    user: CreateUser
  }
}

app.post<CreateUserApi>('/api/users', (req, reply) => {
  pipe(
    req.body.user,
    user.registerUser,
    TE.map(result => reply.send(result)),
    TE.mapLeft(result => reply.code(result.code).send(result.error)),
  )()
})

type LoginUserApi = {
  Body: {
    user: LoginUser
  }
}

app.post<LoginUserApi>('/api/users/login', (req, reply) => {
  pipe(
    req.body.user,
    user.login,
    TE.map(result => reply.send(result)),
    TE.mapLeft(result => reply.code(result.code).send(result.error)),
  )()
})

app.get('/api/user', authOptions, (req, reply) => {
  const payload = getPayload(req.raw.auth)

  pipe(
    user.getCurrentUser({
      id: payload.id,
      authHeader: req.headers.authorization,
    }),
    TE.map(result => reply.send(result)),
    TE.mapLeft(result => reply.code(result.code).send(result.error)),
  )()
})

type UpdateUserApi = {
  Body: {
    user: UpdateUser
  }
}

app.put<UpdateUserApi>('/api/user', authOptions, (req, reply) => {
  const payload = getPayload(req.raw.auth)

  pipe(
    req.body.user,
    user.updateUser({
      id: payload.id,
      authHeader: req.headers.authorization,
    }),
    TE.map(result => reply.send(result)),
    TE.mapLeft(result => reply.code(result.code).send(result.error)),
  )()
})
