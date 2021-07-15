import {
  addCommentToAnArticle as addCommentToAnArticleCore,
  AddCommentToAnArticle,
  OutsideCreateComment,
} from '@/core/use-cases/article/create-comment'
import { CommentOutput } from '@/core/types/comment'

export type OutsideCreateCommentType = OutsideCreateComment<{
  comment: CommentOutput
}>

export const addCommentToAnArticle: AddCommentToAnArticle = (outsideCreateComment) => (data) => {
  return addCommentToAnArticleCore(outsideCreateComment)(data)
}
