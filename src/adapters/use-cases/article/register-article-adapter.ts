import {
  registerArticle as registerArticleCore,
  OutsideRegister,
  RegisterArticle,
} from '@/core/use-cases/article/register-article'
import { ArticleOutput } from '@/core/types/article'

export type OutsideRegisterType = OutsideRegister<{
  article: ArticleOutput
}>

export const registerArticle: RegisterArticle = (outsideRegister) => (data) =>
  registerArticleCore(outsideRegister)(data)
