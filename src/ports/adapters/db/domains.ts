import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { failure } from 'io-ts/PathReporter'
import * as user from '@/core/user/use-cases/register-user-adapter'
import * as article from '@/core/article/use-cases/register-article-adapter'
import * as comment from '@/core/article/use-cases/add-comment-to-an-article-adapter'

import { UserOutput, loginUserCodec } from '@/core/user/types'

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
      token,
    },
  }
}

type Login = (data: unknown) => TE.TaskEither<Error, { user: UserOutput }>
export const login: Login = (data) => {
  return pipe(
    loginUserCodec.decode(data ?? {}),
    E.mapLeft(errors => new Error(failure(errors).join(':::'))),
    TE.fromEither,
    TE.chain(db.login),
    TE.chain(userData =>
      TE.tryCatch(
        async () => {
          const token = await jwt.generateToken({ id: userData.id })

          return {
            user: {
              email: userData.email,
              username: userData.username,
              bio: userData.bio,
              image: userData.image,
              token,
            },
          }
        },
        E.toError,
      ),
    ),
  )
}

export const createArticleInDB: article.OutsideRegisterArticle = async (data) => {
  const registeredArticle = await db.createArticleInDB(data)
  const { authorId, ...articleWithoutAuthorID } = registeredArticle.article

  return {
    article: {
      ...articleWithoutAuthorID,
      favorited: false,
    },
    author: registeredArticle.author,
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
