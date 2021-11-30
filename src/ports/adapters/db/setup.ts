import { CreateArticleInput } from './types'
import { createProvider } from '@/helpers/create-provider'

type DBModule = {
  createArticleInDB<T> (data: CreateArticleInput): Promise<T>

  updateArticleInDB: () => void
  getArticleFromDB: () => void
  getArticlesFromDB: () => void
  getArticlesFeedFromDB: () => void
  deleteArticleFromDB: () => void
  favoriteArticleInDB: () => void
  unfavoriteArticleInDB: () => void
  addCommentToAnArticleInDB: () => void
  getCommentsFromAnArticleInDB: () => void
  deleteCommentFromDB: () => void
  getTagsFromDB: () => void
  createUserInDB: () => void
  login: () => void
  updateUserInDB: () => void
  getCurrentUserFromDB: () => void
  getProfileFromDB: () => void
  followUser: () => void
  unfollowUser: () => void
}

export const [setupDb, db] = createProvider<DBModule>({
  name: 'DB',
  port: (dbProvider) => import(`@/ports/${dbProvider}`),
})
