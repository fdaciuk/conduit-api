import fastifyCors from 'fastify-cors'
import { env } from '@/helpers/env'

import { app } from './server'
import './modules'

const PORT = env('PORT')

app.register(fastifyCors, { origin: true })

export async function start () {
  try {
    await app.listen(PORT, '0.0.0.0')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
