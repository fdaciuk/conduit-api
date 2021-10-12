import { CommentOutput } from '@/core/comment/types'
import { DBUser, DBArticle } from '@/ports/adapters/db/types'

export type DBComment = Omit<CommentOutput, 'author'> & {
  articleId: string
  authorId: string
}

type ArticleID = string
type UserID = string

type DBInMemory = {
  users: { [id: string]: DBUser }
  usersByEmail: { [email: string]: UserID }
  usersByUsername: { [username: string]: UserID }
  articles: { [id: string]: DBArticle }
  articlesBySlug: { [slug: string]: ArticleID }
  comments: { [articleId: string]: DBComment[] }
}

export const dbInMemory: DBInMemory = {
  users: {},
  usersByEmail: {},
  usersByUsername: {},
  articles: {},
  articlesBySlug: {},
  comments: {},
}
