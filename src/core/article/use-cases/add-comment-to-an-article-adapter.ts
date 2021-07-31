import * as comment from './add-comment-to-an-article'
import { CommentOutput } from '@/core/comment/types'

export type OutsideCreateComment = comment.OutsideCreateComment<{
  comment: CommentOutput
}>

export const addCommentToAnArticle: comment.AddCommentToAnArticle = (outsideCreateComment) => (data) => {
  return comment.addCommentToAnArticle(outsideCreateComment)(data)
}
