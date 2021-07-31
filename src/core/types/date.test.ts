import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { dateCodec } from './date'
import { mapAll, getErrorMessage } from '@/config/tests/fixtures'

it('Should validate date properly', async () => {
  const date = new Date().toISOString()

  return pipe(
    date,
    dateCodec.decode,
    TE.fromEither,
    mapAll(result => expect(result).toBe(date)),
  )()
})

it('Should not accept a string different from date ISOString', async () => {
  return pipe(
    '10/10/2010',
    dateCodec.decode,
    TE.fromEither,
    mapAll(errors => expect(getErrorMessage(errors)).toBe('Invalid date. Please use date.toISOString().')),
  )()
})
