import slugify from 'slugify'
import { v4 as uuidv4 } from 'uuid'

import * as user from '@/adapters/use-cases/user/register-user-adapter'
import * as article from '@/adapters/use-cases/article/register-article-adapter'
import * as comment from '@/adapters/use-cases/article/add-comment-to-an-article-adapter'

type DBUser = user.User & {
  id: string
  password: string
}

type DB = {
  users: {
    [id: string]: DBUser
  }
}

const db: DB = {
  users: {},
}

type OutsideRegisterUser = (data: user.CreateUser) => Promise<DBUser | undefined>

export const outsideRegisterUser: OutsideRegisterUser = async (data) => {
  const id = uuidv4()

  db.users[id] = {
    id,
    email: data.email,
    username: data.username,
    password: data.password,
  }

  return db.users[id]
}

export const outsideRegisterArticle: article.OutsideRegisterArticle = async (data) => {
  const date = new Date().toISOString()

  return {
    article: {
      slug: slugify(data.title, { lower: true }),
      title: data.title,
      description: data.description,
      body: data.body,
      tagList: data.tagList ?? [],
      createdAt: date,
      updatedAt: date,
      favorited: false,
      favoritesCount: 0,
      // author: {
      //   "username": "jake",
      //   "bio": "I work at statefarm",
      //   "image": "https://i.stack.imgur.com/xHWG8.jpg",
      //   "following": false
      // }
    },
  }
}

export const outsideCreateComment: comment.OutsideCreateComment = async (data) => {
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
