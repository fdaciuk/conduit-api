import * as article from './register-article'
import { ArticleOutput } from '@/core/article/types'

export type OutsideRegisterArticle = article.OutsideRegisterArticle<{
  article: ArticleOutput
}>

export const registerArticle: article.RegisterArticle = (outsideRegister) => (data) =>
  article.registerArticle(outsideRegister)(data)
