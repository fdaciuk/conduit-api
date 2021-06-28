import * as t from 'io-ts'
import { profileCodec } from '@/core/types/profile'

export const commentCodec = t.type({
  id: t.number,
  createdAt: t.string,
  updatedAt: t.string,
  body: t.string,
  author: profileCodec,
})

export type Comment = t.TypeOf<typeof commentCodec>
