import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { mapAll, getErrorMessage } from '@/config/tests/fixtures'
import { urlCodec } from './url'

it('Should validate the URL properly', async () => {
  return pipe(
    'https://url.com',
    urlCodec.decode,
    TE.fromEither,
    mapAll(result => expect(result).toBe('https://url.com')),
  )()
})

it('Should not accept an invalid URL', async () => {
  return pipe(
    'invalid-url',
    urlCodec.decode,
    TE.fromEither,
    mapAll(errors => expect(getErrorMessage(errors)).toBe('Invalid URL')),
  )()
})
