import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { getPayload } from '@/ports/adapters/http/http'
import * as user from '@/ports/adapters/http/modules/user'

import { app, authOptions, tryAuthOptions } from '../server'

type GetProfileApi = {
  Params: {
    username: string
  }
}

app.get<GetProfileApi>('/api/profiles/:username', tryAuthOptions, (req, reply) => {
  const payload = getPayload(req.raw.auth)

  pipe(
    user.getProfile({
      username: req.params.username,
      userId: payload.id,
    }),
    TE.map(result => reply.send(result)),
    TE.mapLeft(result => reply.code(result.code).send(result.error)),
  )()
})

type FollowUserApi = {
  Params: {
    username: string
  }
}

app.post<FollowUserApi>('/api/profiles/:username/follow', authOptions, (req, reply) => {
  const payload = getPayload(req.raw.auth)

  pipe(
    user.followUser({
      userToFollow: req.params.username,
      userId: payload.id,
    }),
    TE.map(result => reply.send(result)),
    TE.mapLeft(result => reply.code(result.code).send(result.error)),
  )()
})

app.delete<FollowUserApi>('/api/profiles/:username/follow', authOptions, (req, reply) => {
  const payload = getPayload(req.raw.auth)

  pipe(
    user.unfollowUser({
      userToUnfollow: req.params.username,
      userId: payload.id,
    }),
    TE.map(result => reply.send(result)),
    TE.mapLeft(result => reply.code(result.code).send(result.error)),
  )()
})
