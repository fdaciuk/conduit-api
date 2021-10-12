import { v4 as uuidv4 } from 'uuid'

import { NotFoundError } from '@/helpers/errors'
import { dbInMemory as db } from './db'

import {
  CreateArticleInDB,
  AddCommentToAnArticleInDB,
  DBArticle,
  DBComment,
  DBUser,
} from '@/ports/adapters/db/types'

type ArticleReturned = DBArticle & {
  author: DBUser
}
export const createArticleInDB: CreateArticleInDB<ArticleReturned> = async (data) => {
  const id = uuidv4()
  const date = new Date().toISOString()

  const author = getUserProfileFromDB(data.authorId)

  db.articlesBySlug[data.slug] = id

  const registeredArticle = db.articles[id] = {
    id,
    slug: data.slug,
    title: data.title,
    description: data.description,
    body: data.body,
    tagList: data.tagList ?? [],
    createdAt: date,
    updatedAt: date,
    favoritesCount: 0,
    authorId: data.authorId,
  }

  return {
    ...registeredArticle,
    author,
  }
}

type CommentReturned = DBComment & {
  author: DBUser
}

export const addCommentToAnArticleInDB: AddCommentToAnArticleInDB<CommentReturned> = async (data) => {
  const date = new Date().toISOString()
  const id = Date.now()
  const articleId = db.articlesBySlug[data.articleSlug] || ''

  const author = getUserProfileFromDB(data.authorId)

  const comment = {
    id,
    createdAt: date,
    updatedAt: date,
    body: data.body,
    articleId,
    authorId: data.authorId,
  }

  db.comments[articleId] = (db.comments[articleId] ?? []).concat(comment)

  return { ...comment, author }
}

function getUserProfileFromDB (userId: string) {
  const user = db.users[userId]

  if (!user) {
    throw new NotFoundError('User does not exist')
  }

  return user
}
