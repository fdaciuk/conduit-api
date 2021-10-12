import { v4 as uuidv4 } from 'uuid'

import { CreateComment } from '@/core/comment/types'
import { ProfileOutput } from '@/core/profile/types'

import { NotFoundError } from '@/helpers/errors'
import { dbInMemory as db } from './db'

import { CreateArticleInDB, DBArticle, DBUser } from '@/ports/adapters/db/types'

type ReturnedDBArticle = DBArticle & {
  author: DBUser
}
export const createArticleInDB: CreateArticleInDB<ReturnedDBArticle> = async (data) => {
  const id = uuidv4()
  const date = new Date().toISOString()

  const author = db.users[data.authorId]

  if (!author) {
    throw new NotFoundError('User does not exist')
  }

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

export const addCommentToAnArticleInDB = async (data: CreateComment) => {
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

function getUserProfileFromDB (userId: string): ProfileOutput {
  const user = db.users[userId]

  if (!user) {
    throw new NotFoundError('User does not exist')
  }

  return {
    username: user.username,
    bio: user.bio ?? '',
    image: user.image ?? '',
    following: false,
  }
}
