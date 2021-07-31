import * as t from 'io-ts'
import { withMessage, NonEmptyString, UUID } from 'io-ts-types'
import { profileCodec } from '@/core/profile/types'
import { dateCodec, slugCodec } from '@/core/types'

const commentCodecRequired = t.type({
  id: t.number,
  createdAt: dateCodec,
  updatedAt: dateCodec,
  body: t.string,
})

const commentCodecOptional = t.partial({
  author: profileCodec,
})

export const commentCodec = t.intersection([
  commentCodecRequired,
  commentCodecOptional,
])

export type Comment = t.TypeOf<typeof commentCodec>
export type CommentOutput = t.OutputOf<typeof commentCodec>

export const createCommentCodec = t.type({
  authorId: withMessage(UUID, () => 'Invalid author ID'),
  articleSlug: slugCodec,
  body: withMessage(
    NonEmptyString,
    () => 'The body of the comment must not be empty.',
  ),
})

export type CreateComment = t.TypeOf<typeof createCommentCodec>
