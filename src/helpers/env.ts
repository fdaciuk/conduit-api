import { failure } from 'io-ts/PathReporter'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { withMessage, NonEmptyString } from 'io-ts-types'

type Envs =
  | 'PORT'
  | 'JWT_SECRET'

export const env = (value: Envs) => {
  const envCodec = withMessage(
    NonEmptyString,
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
