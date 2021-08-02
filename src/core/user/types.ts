import * as t from 'io-ts'
import {
  emailCodec,
  passwordCodec,
  slugCodec,
  urlCodec,
} from '@/core/types'

const userCodecRequired = t.type({
  email: emailCodec,
  username: slugCodec,
})

const userCodecOptional = t.partial({
  token: t.string,
  bio: t.string,
  image: urlCodec,
})

export const userCodec = t.intersection([
  userCodecRequired,
  userCodecOptional,
])

export type User = t.TypeOf<typeof userCodec>
export type UserOutput = t.OutputOf<typeof userCodec>

export const createUserCodec = t.type({
  username: slugCodec,
  email: emailCodec,
  password: passwordCodec,
})

export type CreateUser = t.TypeOf<typeof createUserCodec>

export const loginUserCodec = t.type({
  email: emailCodec,
  password: passwordCodec,
})

export type LoginUser = t.TypeOf<typeof loginUserCodec>
