import * as t from 'io-ts'
import { slugCodec } from '@/core/types'

export const tagCodec = slugCodec

export type Tag = t.TypeOf<typeof tagCodec>
