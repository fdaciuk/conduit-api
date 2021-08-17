import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { CreateArticle } from '@/core/article/types'
import { CreateComment } from '@/core/comment/types'
import * as db from '@/ports/adapters/db'
import * as article from '@/core/article/use-cases/register-article-adapter'
import * as comment from '@/core/article/use-cases/add-comment-to-an-article'

import { getError } from '@/ports/adapters/http/http'

export function registerArticle (data: CreateArticle) {
  return pipe(
    data,
    article.registerArticle(db.createArticleInDB),
    TE.mapLeft(error => getError(error.message)),
  )
}

export function addCommentToAnArticle (data: CreateComment) {
  return pipe(
    data,
    comment.addCommentToAnArticle(db.addCommentToAnArticleInDB),
    TE.mapLeft(error => getError(error.message)),
  )
}
