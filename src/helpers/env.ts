import * as t from 'io-ts'
import { failure } from 'io-ts/PathReporter'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { withMessage, NonEmptyString, NumberFromString } from 'io-ts-types'
import { ValidationError } from '@/helpers/errors'

const envsCodecs = {
  HTTP_PORT: createUnionCodec('HTTP_PORT', ['express', 'fastify']),
  DB_PORT: createUnionCodec('DB_PORT', ['db-in-memory', 'prisma']),
  JWT_PORT: createUnionCodec('JWT_PORT', ['jose']),
  PORT: withMessage(NumberFromString, () => '"PORT" should be a number'),
  JWT_SECRET: t.string,
}

type Envs = keyof typeof envsCodecs

export const env = (value: Envs): string => {
  const envCodec = createEnvCodec(value)

  return pipe(
    envCodec.decode(process.env[value]),
    E.fold(
      (errors) => { throw new ValidationError(failure(errors).join(':::')) },
      (value) => value,
    ),
  )
}

const createEnvCodec = (value: Envs) => {
  return t.intersection([
    withMessage(NonEmptyString, () => `You must set the env var ${value}`),
    envsCodecs[value],
  ])
}

function createUnionCodec (name: string, values: string[]) {
  const valuesObj = values.reduce<Record<string, null>>((acc, value) => {
    acc[value] = null
    return acc
  }, {})

  const valuesMessage = values
    .map(v => `"${v}"`)
    .join(', ')
    .replace(/, "(\w+)"$/, ' or "$1"')

  return withMessage(
    t.keyof(valuesObj),
    () => `"${name}" only accepts ${valuesMessage}`,
  )
}
