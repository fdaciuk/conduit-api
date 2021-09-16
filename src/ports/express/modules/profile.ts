import { Router, Response } from 'express'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { getPayload } from '@/ports/adapters/http/http'
import * as user from '@/ports/adapters/http/modules/user'
import { Request, auth, tryAuth } from '../server'

const profileRoutes = Router()

profileRoutes.get('/api/profiles/:username', tryAuth, (req: Request, res: Response) => {
  const username = 'username'
  const payload = getPayload(req.auth)

  pipe(
    user.getProfile({
      username: req.params[username] ?? '',
      userId: payload.id,
    }),
    TE.map(result => res.json(result)),
    TE.mapLeft(result => res.status(result.code).json(result.error)),
  )()
})

profileRoutes.post('/api/profiles/:username/follow', auth, (req: Request, res: Response) => {
  const username = 'username'
  const payload = getPayload(req.auth)

  pipe(
    user.followUser({
      userToFollow: req.params[username] ?? '',
      userId: payload.id,
    }),
    TE.map(result => res.json(result)),
    TE.mapLeft(result => res.status(result.code).json(result.error)),
  )()
})

profileRoutes.delete('/api/profiles/:username/follow', auth, (req: Request, res: Response) => {
  const username = 'username'
  const payload = getPayload(req.auth)

  pipe(
    user.unfollowUser({
      userToUnfollow: req.params[username] ?? '',
      userId: payload.id,
    }),
    TE.map(result => res.json(result)),
    TE.mapLeft(result => res.status(result.code).json(result.error)),
  )()
})

export { profileRoutes }
