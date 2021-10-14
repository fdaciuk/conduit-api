import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import { CreateArticle, ArticleOutput } from '@/core/article/types'
import { CreateComment, CommentOutput } from '@/core/comment/types'
import * as db from '@/ports/adapters/db'
import * as article from '@/core/article/use-cases'

import { getError } from '@/ports/adapters/http/http'
import { DBArticle } from '@/ports/adapters/db/types'

import { ArticlesFilter } from '../types'

export function registerArticle (data: CreateArticle) {
  return pipe(
    data,
    article.registerArticle(db.createArticleInDB),
    TE.map(getArticleResponse),
    TE.mapLeft(getError),
  )
}

export function fetchArticles (filter: ArticlesFilter) {
  return pipe(
    TE.tryCatch(
      () => db.getArticlesFromDB(filter),
      E.toError,
    ),
    TE.map(getArticlesResponse),
    TE.mapLeft(getError),
  )
}

function getArticlesResponse (articles: DBArticle[]) {
  return {
    articles,
    articlesCount: articles.length,
  }
}

export function addCommentToAnArticle (data: CreateComment) {
  return pipe(
    data,
    article.addCommentToAnArticle(db.addCommentToAnArticleInDB),
    TE.map(getCommentResponse),
    TE.mapLeft(getError),
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

const getCommentResponse = (comment: CommentOutput) => {
  return {
    comment,
  }
}
