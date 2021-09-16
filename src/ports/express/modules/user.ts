import { Response, Router } from 'express'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as user from '@/ports/adapters/http/modules/user'
import { getPayload } from '@/ports/adapters/http/http'
import { Request, auth } from '../server'

const userRoutes = Router()

userRoutes.post('/api/users', async (req: Request, res: Response) => {
  return pipe(
    req.body.user,
    user.registerUser,
    TE.map(result => res.json(result)),
    TE.mapLeft(result => res.status(result.code).json(result.error)),
  )()
})

userRoutes.post('/api/users/login', async (req: Request, res: Response) => {
  return pipe(
    req.body.user,
    user.login,
    TE.map(result => res.json(result)),
    TE.mapLeft(result => res.status(result.code).json(result.error)),
  )()
})

userRoutes.get('/api/user', auth, (req: Request, res: Response) => {
  const payload = getPayload(req.auth)

  return pipe(
    user.getCurrentUser({
      id: payload.id,
      authHeader: req.header('authorization'),
    }),
    TE.map(result => res.json(result)),
    TE.mapLeft(result => res.status(result.code).json(result.error)),
  )()
})

userRoutes.put('/api/user', auth, (req: Request, res: Response) => {
  const payload = getPayload(req.auth)

  pipe(
    req.body.user,
    user.updateUser({
      id: payload.id,
      authHeader: req.header('authorization'),
    }),
    TE.map(result => res.json(result)),
    TE.mapLeft(result => res.status(result.code).json(result.error)),
  )()
})

export { userRoutes }
