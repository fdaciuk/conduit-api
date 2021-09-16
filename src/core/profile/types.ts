import * as t from 'io-ts'
import { withMessage, UUID } from 'io-ts-types'
import { slugCodec, urlCodec } from '@/core/types'

export const profileCodec = t.type({
  username: slugCodec,
  bio: t.string,
  image: urlCodec,
  following: t.boolean,
})

export type Profile = t.TypeOf<typeof profileCodec>
export type ProfileOutput = t.OutputOf<typeof profileCodec>

export const authorIdCodec = makeAuthorId(UUID)
export type AuthorId = t.TypeOf<typeof authorIdCodec>

export const authorIdOutputCodec = makeAuthorId(t.string)
export type AuthorIdOutput = t.OutputOf<typeof authorIdCodec>

function makeAuthorId <C extends t.Any> (type: C) {
  return withMessage(type, () => 'Invalid author ID')
}
