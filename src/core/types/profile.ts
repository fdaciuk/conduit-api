import * as t from 'io-ts'

export const profileCodec = t.type({
  username: t.string,
  bio: t.string,
  image: t.string,
  following: t.boolean,
})

export type Profile = t.TypeOf<typeof profileCodec>
