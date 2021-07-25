import { User } from '@/core/types/user'
import { ArticleOutput } from '@/core/types/article'

export type DBUser = User & {
  id: string
  password: string
}

export type DBArticle = Omit<ArticleOutput, 'favorited' | 'author'> & {
  id: string
  authorId: string
}

type DB = {
  users: { [id: string]: DBUser }
  articles: { [id: string]: DBArticle }
}

export const db: DB = {
  users: {},
  articles: {},
}
