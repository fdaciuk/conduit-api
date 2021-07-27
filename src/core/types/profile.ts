import * as t from 'io-ts'
import { slugCodec, urlCodec } from '@/core/types/scalar'

export const profileCodec = t.type({
  username: slugCodec,
  bio: t.string,
  image: urlCodec,
  following: t.boolean,
})

export type Profile = t.TypeOf<typeof profileCodec>
export type ProfileOutput = t.OutputOf<typeof profileCodec>
