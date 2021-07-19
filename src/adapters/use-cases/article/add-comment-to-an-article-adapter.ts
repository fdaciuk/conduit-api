import * as comment from '@/core/use-cases/article/create-comment'
import { CommentOutput } from '@/core/types/comment'

export type OutsideCreateComment = comment.OutsideCreateComment<{
  comment: CommentOutput
}>

export const addCommentToAnArticle: comment.AddCommentToAnArticle = (outsideCreateComment) => (data) => {
  return comment.addCommentToAnArticle(outsideCreateComment)(data)
}
