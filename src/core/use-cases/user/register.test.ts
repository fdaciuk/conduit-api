import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { register, OutsideRegister } from './register'
import { CreateUser } from '@/core/types/user'
import { unsafeEmail } from '@/config/tests/fixtures'

const registerOk: OutsideRegister<string> = async (data) => {
  return `Usuário ${data.username} cadastrado com sucesso!`
}

const data: CreateUser = {
  username: 'john',
  email: unsafeEmail('john@doe.com'),
  password: 'jhon123!',
}

it('Deveria cadastrar um usuário com sucesso', async () => {
  return pipe(
    data,
    register(registerOk),
    TE.map(result => expect(result).toBe(`Usuário ${data.username} cadastrado com sucesso!`)),
  )()
})
