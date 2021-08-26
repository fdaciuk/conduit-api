import * as user from '@/core/user/use-cases/register-user-adapter'
import * as article from '@/core/article/use-cases/register-article-adapter'
import * as comment from '@/core/article/use-cases/add-comment-to-an-article-adapter'

import { LoginUser, UserOutput } from '@/core/user/types'

import * as jwt from '@/ports/adapters/jwt'

import { database as db } from './db'

export const createUserInDB: user.OutsideRegisterUser = async (data) => {
  const registeredUser = await db.createUserInDB(data)

  const token = await jwt.generateToken({ id: registeredUser.id })

  return {
    user: {
      username: registeredUser.username,
      email: registeredUser.email,
      bio: '',
      image: '',
      token,
    },
  }
}

type Login = (data: LoginUser) => Promise<{ user: UserOutput }>
export const login: Login = async (data) => {
  const userData = await db.login(data)

  const token = await jwt.generateToken({ id: userData.id })

  return {
    user: {
      email: userData.email,
      username: userData.username,
      bio: userData.bio ?? '',
      image: userData.image ?? '',
      token,
    },
  }
}

export const createArticleInDB: article.OutsideRegisterArticle = async (data) => {
  const registeredArticle = await db.createArticleInDB(data)
  const { authorId, ...articleWithoutAuthorID } = registeredArticle.article

  return {
    article: {
      ...articleWithoutAuthorID,
      favorited: false,
      author: registeredArticle.author,
    },
  }
}

export const addCommentToAnArticleInDB: comment.OutsideCreateComment = async (data) => {
  const registeredComment = await db.addCommentToAnArticleInDB(data)
  const { authorId, articleId, ...comment } = registeredComment.comment

  return {
    comment: {
      ...comment,
      author: registeredComment.author,
    },
  }
}
