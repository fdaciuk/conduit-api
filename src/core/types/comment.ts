import * as t from 'io-ts'
import { withMessage, NonEmptyString } from 'io-ts-types'
import { profileCodec } from '@/core/types/profile'
import { dateCodec } from '@/core/types/scalar'

export const commentCodec = t.type({
  id: t.number,
  createdAt: dateCodec,
  updatedAt: dateCodec,
  body: t.string,
  author: profileCodec,
})

export type Comment = t.TypeOf<typeof commentCodec>
export type OutputComment = t.OutputOf<typeof commentCodec>

export const createCommentCodec = t.type({
  body: withMessage(
    NonEmptyString,
    () => 'The body of the comment must not be empty.',
  ),
})

export type CreateComment = t.TypeOf<typeof createCommentCodec>
