import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { mapAll, getErrorMessage } from '@/config/tests/fixtures'
import { slugCodec } from './slug'

it('Should validate slug properly', async () => {
  return pipe(
    'valid-slug',
    slugCodec.decode,
    TE.fromEither,
    mapAll(result => expect(result).toBe('valid-slug')),
  )()
})

it('Should accept 3 or more characters', async () => {
  return pipe(
    'slu',
    slugCodec.decode,
    TE.fromEither,
    mapAll(result => expect(result).toBe('slu')),
  )()
})

it('Should not accept numbers at the beginning of the slug', async () => {
  return pipe(
    '3invalid-slug',
    slugCodec.decode,
    TE.fromEither,
    mapAll(errors => expect(getErrorMessage(errors)).toBe('Invalid slug. Please, use alphanumeric characters, dash, underline and/or numbers.')),
  )()
})

it('Should not accept dashes at the end of the slug', async () => {
  return pipe(
    'invalid-slug-',
    slugCodec.decode,
    TE.fromEither,
    mapAll(errors => expect(getErrorMessage(errors)).toBe('Invalid slug. Please, use alphanumeric characters, dash, underline and/or numbers.')),
  )()
})

it('Should not accept less than 3 characters', async () => {
  return pipe(
    'sl',
    slugCodec.decode,
    TE.fromEither,
    mapAll(errors => expect(getErrorMessage(errors)).toBe('Invalid slug. Please, use alphanumeric characters, dash, underline and/or numbers.')),
  )()
})
