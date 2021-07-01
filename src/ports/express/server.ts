import express, { Request, Response } from 'express'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import {
  register,
  OutsideRegisterType,
} from '@/adapters/user/register-adapter'

const app = express()

const PORT = 3333

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const outsideRegister: OutsideRegisterType = async (data) => {
  return {
    success: true,
    data,
  }
}

app.post('/api/users', async (req: Request, res: Response) => {
  return pipe(
    req.body.user,
    register(outsideRegister),
    TE.map(result => res.json(result)),
    TE.mapLeft(error => res.status(400).json(error.message)),
  )()
})

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
