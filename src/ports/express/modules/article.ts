import { Response, Router } from 'express'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as article from '@/ports/adapters/http/modules/article'
import { getPayload } from '@/ports/adapters/http/http'
import { Request, auth } from '../server'

const articleRoutes = Router()

articleRoutes.post('/api/articles', auth, async (req: Request, res: Response) => {
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

articleRoutes.get('/api/articles', (req: Request, response: Response) => {
  pipe(
    article.fetchArticles(req.query),
    TE.map(result => response.json(result)),
    TE.mapLeft(result => response.status(result.code).json(result.error)),
  )()
})

articleRoutes.post('/api/articles/:slug/comments', auth, async (req: Request, res: Response) => {
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

export { articleRoutes }
