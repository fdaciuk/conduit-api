import {
  registerArticle as registerArticleCore,
  OutsideRegister,
  RegisterArticle,
} from '@/core/use-cases/article/register-article'
import { Article } from '@/core/types/article'

export type OutsideRegisterType = OutsideRegister<{
  article: Article
}>

export const registerArticle: RegisterArticle = (outsideRegister) => (data) =>
  registerArticleCore(outsideRegister)(data)
