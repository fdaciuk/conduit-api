import { pipe } from 'fp-ts/function'
import { dateCodec } from './date'
import { mapAllE } from '@/config/tests/fixtures'
it('Should validate date properly', () => {
  const date = new Date().toISOString()
  pipe(
    date,
    dateCodec.decode,
    mapAllE(result => expect(result).toBe(date)),
  )
})
