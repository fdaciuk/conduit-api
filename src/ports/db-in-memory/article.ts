import { v4 as uuidv4 } from 'uuid'
import slugify from 'slugify'

import { CreateArticle } from '@/core/types/article'
import * as comment from '@/adapters/use-cases/article/add-comment-to-an-article-adapter'
import { db } from './db'

export const createArticleInDB = async (data: CreateArticle) => {
  const id = uuidv4()
  const date = new Date().toISOString()

  const author = db.users[data.authorId]

  if (!author) {
    throw new Error('Invalid author ID')
  }

  const registeredArticle = db.articles[id] = {
    id,
    slug: slugify(data.title, { lower: true }),
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
    article: registeredArticle,
    author: {
      email: author.email,
      username: author.id,
      bio: author.bio,
      image: author.image,
      following: false,
    },
  }
}

export const addCommentToAnArticleInDB: comment.OutsideCreateComment = async (data) => {
  const date = new Date().toISOString()

  return {
    comment: {
      id: Date.now(),
      createdAt: date,
      updatedAt: date,
      body: data.body,
      // author: {
      //   "username": "jake",
      //   "bio": "I work at statefarm",
      //   "image": "https://i.stack.imgur.com/xHWG8.jpg",
      //   "following": false
      // }
    },
  }
}
