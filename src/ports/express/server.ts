import express, {
  Request as ExpressRequest,
  Response,
  NextFunction,
} from 'express'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import cors from 'cors'
import * as user from '@/ports/adapters/http/modules/user'
import * as article from '@/ports/adapters/http/modules/article'
import { authMiddleware, getPayload } from '@/ports/adapters/http/http'
import { env } from '@/helpers'
import { JWTPayload } from '@/ports/adapters/jwt'

type Request = ExpressRequest & {
  auth?: JWTPayload
}

const app = express()

const PORT = env('PORT')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app
  .disable('x-powered-by')
  .disable('etag')

app.use(cors())

app.post('/api/users', async (req: Request, res: Response) => {
  return pipe(
    req.body.user,
    user.registerUser,
    TE.map(result => res.json(result)),
    TE.mapLeft(result => res.status(result.code).json(result.error)),
  )()
})

app.post('/api/users/login', async (req: Request, res: Response) => {
  return pipe(
    req.body.user,
    user.login,
    TE.map(result => res.json(result)),
    TE.mapLeft(result => res.status(result.code).json(result.error)),
  )()
})

async function auth (req: Request, res: Response, next: NextFunction) {
  pipe(
    authMiddleware(req.header('authorization')),
    TE.map((payload) => {
      req.auth = payload
      return next()
    }),
    TE.mapLeft(result => res.status(result.code).json(result.error)),
  )()
}

app.get('/api/user', auth, (req: Request, res: Response) => {
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

app.put('/api/user', auth, (req: Request, res: Response) => {
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

app.get('/api/profiles/:username', (req: Request, res: Response) => {
  const username = 'username'

  pipe(
    user.getProfile({
      username: req.params[username] ?? '',
    }),
    TE.map(result => res.json(result)),
    TE.mapLeft(result => res.status(result.code).json(result.error)),
  )()
})

app.post('/api/profiles/:username/follow', auth, (req: Request, res: Response) => {
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

app.delete('/api/profiles/:username/follow', auth, (req: Request, res: Response) => {
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

app.post('/api/articles', auth, async (req: Request, res: Response) => {
  const payload = getPayload(req.auth)

  const data = {
    ...req.body.article,
    authorId: payload.id,
  }

  return pipe(
    data,
    article.registerArticle,
    TE.map(result => res.json(result)),
    TE.mapLeft(result => res.status(result.code).json(result.error)),
  )()
})

app.post('/api/articles/:slug/comments', auth, async (req: Request, res: Response) => {
  const payload = getPayload(req.auth)
  const slugProp = 'slug'

  const data = {
    ...req.body.comment,
    authorId: payload.id,
    articleSlug: req.params[slugProp],
  }

  return pipe(
    data,
    article.addCommentToAnArticle,
    TE.map(result => res.json(result)),
    TE.mapLeft(result => res.status(result.code).json(result.error)),
  )()
})

export function start () {
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
  })
}
