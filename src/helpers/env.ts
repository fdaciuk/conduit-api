import * as t from 'io-ts'
import { failure } from 'io-ts/PathReporter'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { withMessage } from 'io-ts-types'

type LengthBrand = {
  readonly NonEmptyString: unique symbol
}

const nonEmptyStringCodec = t.brand(
  t.string,
  (value): value is t.Branded<string, LengthBrand> => isNonEmptyString(value),
  'NonEmptyString',
)

export const env = (value: string) => {
  const envCodec = withMessage(
    nonEmptyStringCodec,
    () => `You must set the env var ${value}`,
  )

  return pipe(
    envCodec.decode(process.env[value]),
    E.fold(
      (errors) => { throw new Error(failure(errors).join(':::')) },
      (value) => value,
    ),
  )
}

function isNonEmptyString (value: unknown) {
  return typeof value === 'string' && value.length > 0
}
