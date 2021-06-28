import * as t from 'io-ts'

export const tagCodec = t.string

export type Tag = t.TypeOf<typeof tagCodec>
