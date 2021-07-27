import { UserOutput } from '@/core/types/user'
import { ArticleOutput } from '@/core/types/article'
import { CommentOutput } from '@/core/types/comment'

export type DBUser = Omit<UserOutput, 'token'> & {
  id: string
  password: string
}

export type DBArticle = Omit<ArticleOutput, 'favorited' | 'author'> & {
  id: string
  authorId: string
}

export type DBComment = Omit<CommentOutput, 'author'> & {
  articleId: string
  authorId: string
}

type ArticleID = string

type DB = {
  users: { [id: string]: DBUser }
  articles: { [id: string]: DBArticle }
  articlesBySlug: { [slug: string]: ArticleID }
  comments: { [articleId: string]: DBComment[] }
}

export const db: DB = {
  users: {},
  articles: {},
  articlesBySlug: {},
  comments: {},
}
