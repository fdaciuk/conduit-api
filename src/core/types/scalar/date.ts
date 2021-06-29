import * as t from 'io-ts'
import { withMessage } from 'io-ts-types'

type DateBrand = {
  readonly Date: unique symbol
}

export const dateCodec = withMessage(
  t.brand(
    t.string,
    (value): value is t.Branded<string, DateBrand> => isDate(value),
    'Date',
  ),
  () => 'Invalid date. Please use date.toISOString().',
)

export type Date = t.TypeOf<typeof dateCodec>

function isDate (value: string) {
  return /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value)
}
