import * as t from 'io-ts'
import {
  emailCodec,
  passwordCodec,
  slugCodec,
  urlCodec,
} from '@/core/types/scalar'

export const userCodec = t.type({
  email: emailCodec,
  token: t.string,
  username: slugCodec,
  bio: t.string,
  image: urlCodec,
})

export type User = t.TypeOf<typeof userCodec>

export const createUserCodec = t.type({
  username: slugCodec,
  email: emailCodec,
  password: passwordCodec,
})

export type CreateUser = t.TypeOf<typeof createUserCodec>
