import * as t from 'io-ts'
import { withMessage } from 'io-ts-types'
import { URL } from 'url'

type UrlBrand = {
  readonly Url: unique symbol
}

export const urlCodec = withMessage(
  t.brand(
    t.string,
    (value): value is t.Branded<string, UrlBrand> => isUrl(value),
    'Url',
  ),
  () => 'Invalid URL',
)

export type Url = t.TypeOf<typeof urlCodec>

function isUrl (input: unknown) {
  try {
    const url = new URL(typeof input === 'string' ? input : '')
    return !!url
  } catch {
    return false
  }
}
