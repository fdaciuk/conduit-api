import http from 'http'
import { env } from '@/helpers/env'

import { app } from './server'

const PORT = env('PORT')

export function start () {
  http
    .createServer(app)
    .listen(PORT, () => console.log(`Server is listening on port ${PORT}`))
}
