import express, { Request, Response } from 'express'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import { register } from '@/adapters/use-cases/user/register-adapter'
import { userRegister } from '@/adapters/ports/db'

const app = express()

const PORT = process.env.PORT

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/api/users', async (req: Request, res: Response) => {
  return pipe(
    req.body.user,
    register(userRegister),
    TE.map(result => res.json(result)),
    TE.mapLeft(error => res.status(400).json(error.message)),
  )()
})

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
