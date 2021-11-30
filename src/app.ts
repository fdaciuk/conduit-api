import { env } from '@/helpers/env'
import { setupJwt } from '@/ports/adapters/jwt/setup'
import { setupDb } from '@/ports/adapters/db/setup'

async function main () {
  await setupJwt(env('JWT_PROVIDER'))
  await setupDb(env('DB_PROVIDER'))

  const httpProvider = await import(`@/ports/${env('HTTP_PROVIDER')}`)
  await httpProvider.start()
}

main()
