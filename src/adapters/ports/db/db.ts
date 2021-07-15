import {
  outsideRegister,
  outsideRegisterArticle,
  outsideCreateComment,
} from '@/ports/db-in-memory/db'

import {
  OutsideRegisterType,
} from '@/adapters/use-cases/user/register-user-adapter'

import {
  OutsideRegisterType as OutsideRegisterArticle,
} from '@/adapters/use-cases/article/register-article-adapter'

import {
  OutsideCreateCommentType,
} from '@/adapters/use-cases/article/add-comment-to-an-article-adapter'

export const createUserInDB: OutsideRegisterType = (data) => {
  return outsideRegister(data)
}

export const createArticleInDB: OutsideRegisterArticle = (data) => {
  return outsideRegisterArticle(data)
}

export const addCommentToAnArticleInDB: OutsideCreateCommentType = (data) => {
  return outsideCreateComment(data)
}
