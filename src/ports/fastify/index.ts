import fastifyCors from '@fastify/cors'
import { env } from '@/helpers/env'

import { app } from './server'
import './modules'

const PORT = env('PORT')

app.register(fastifyCors, { origin: true })

export async function start () {
  return new Promise((resolve, reject) => {
    app.listen({ port: +PORT, host: '0.0.0.0' }, (err, address) => {
      if (err) {
        app.log.error(err)
        return reject(err)
      }

      resolve(address)
    })
  })
}
