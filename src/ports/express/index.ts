import express from 'express'
import cors from 'cors'
import { env } from '@/helpers'
import { userRoutes, articleRoutes, profileRoutes } from './modules'

const app = express()

const PORT = env('PORT')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app
  .disable('x-powered-by')
  .disable('etag')

app.use(cors())

app.use(userRoutes)
app.use(articleRoutes)
app.use(profileRoutes)

export function start () {
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
  })
}
