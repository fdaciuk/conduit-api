import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { CreateArticle, ArticleOutput } from '@/core/article/types'
import { CreateComment, CommentOutput } from '@/core/comment/types'
import * as db from '@/ports/adapters/db'
import * as article from '@/core/article/use-cases/register-article-adapter'
import * as comment from '@/core/article/use-cases/add-comment-to-an-article'

import { getError } from '@/ports/adapters/http/http'

export function registerArticle (data: CreateArticle) {
  return pipe(
    data,
    article.registerArticle(db.createArticleInDB),
    TE.map(getArticleResponse),
    TE.mapLeft(error => getError(error.message)),
  )
}

export function addCommentToAnArticle (data: CreateComment) {
  return pipe(
    data,
    comment.addCommentToAnArticle(db.addCommentToAnArticleInDB),
    TE.map(getAddCommentToAnArticleResponse),
    TE.mapLeft(error => getError(error.message)),
  )
}

type GetArticleResponseInput = Omit<ArticleOutput, 'favorited'> & {
  authorId: string
}

const getArticleResponse = (article: GetArticleResponseInput) => {
  const { authorId, ...articleResponse } = article
  return {
    article: {
      ...articleResponse,
      favorited: false,
    },
  }
}

type GetAddCommentToAnArticleInput = CommentOutput & {
  authorId: string
  articleId: string
}

const getAddCommentToAnArticleResponse = (registeredComment: GetAddCommentToAnArticleInput) => {
  const { authorId, articleId, ...comment } = registeredComment

  return { comment }
}
