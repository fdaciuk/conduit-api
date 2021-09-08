import * as t from 'io-ts'
import { withMessage } from 'io-ts-types'

type SlugBrand = {
  readonly Slug: unique symbol
}

export const slugCodec = withMessage(
  t.brand(
    t.string,
    (value): value is t.Branded<string, SlugBrand> => isSlug(value),
    'Slug',
  ),
  () => 'Invalid slug. Please, use alphanumeric characters, dash, underline and/or numbers.',
)

export type Slug = t.TypeOf<typeof slugCodec>

function isSlug (value: string) {
  /**
   * Accept:
   * - must starts with any letter;
   * - followed by a letter, a number, an underline or a dash;
   * - must ends with a letter or a number.
   */
  return /^[a-z][a-z0-9_-]+?[a-z0-9]$/.test(value)
}
