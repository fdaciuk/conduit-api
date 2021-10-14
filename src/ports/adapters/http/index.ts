import { env } from '@/helpers/env'

const HTTP_PORT = env('HTTP_PORT')

import(`@/ports/${HTTP_PORT}`).then((http) => {
  console.log('HTTP_PORT:', HTTP_PORT)
  http.start()
})
