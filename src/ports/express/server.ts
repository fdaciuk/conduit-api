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

import { env } from '@/helpers'
import { verifyToken, JWTPayload } from '@/ports/adapters/jwt'

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
    TE.mapLeft(error => res.status(422).json(error)),
  )()
})

app.post('/api/users/login', async (req: Request, res: Response) => {
  return pipe(
    req.body.user,
    user.login,
    TE.map(result => res.json(result)),
    TE.mapLeft(error => res.status(422).json(error)),
  )()
})

async function auth (req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.header('authorization')?.replace('Bearer ', '') ?? ''
    const payload = await verifyToken(token)
    req.auth = payload
    next()
  } catch {
    res.status(401).json(getError('Unauthorized'))
  }
}

app.post('/api/articles', auth, async (req: Request, res: Response) => {
  const payload = req.auth ?? {}
  const idProp = 'id'

  const data = {
    ...req.body.article,
    authorId: payload[idProp],
  }

  return pipe(
    data,
    article.registerArticle,
    TE.map(result => res.json(result)),
    TE.mapLeft(error => res.status(422).json(error)),
  )()
})

app.post('/api/articles/:slug/comments', auth, async (req: Request, res: Response) => {
  const payload = req.auth ?? {}
  const idProp = 'id'
  const slugProp = 'slug'

  const data = {
    ...req.body.comment,
    authorId: payload[idProp],
    articleSlug: req.params[slugProp],
  }

  return pipe(
    data,
    article.addCommentToAnArticle,
    TE.map(result => res.json(result)),
    TE.mapLeft(error => res.status(422).json(error)),
  )()
})

export function start () {
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
  })
}

function getError (errors: string) {
  return {
    errors: {
      body: errors.split(':::'),
    },
  }
}
