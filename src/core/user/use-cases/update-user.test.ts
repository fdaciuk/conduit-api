import { pipe } from 'fp-ts/function'
import { updateUser, OutsideUpdateUser } from './update-user'
import { UpdateUser } from '@/core/user/types'
import { mapAll, unsafe } from '@/config/tests/fixtures'

const registerOk: OutsideUpdateUser<string> = async (data) => {
  return `Usuário ${data.username} atualizado com sucesso!`
}

const registerFail: OutsideUpdateUser<never> = async () => {
  throw new Error('External error!')
}

const data: UpdateUser = {
  username: unsafe('john'),
}

const dataWithWrongUsername: UpdateUser = {
  username: unsafe('a'),
}

const dataWithWrongEmailAndPassword: UpdateUser = {
  email: unsafe('john'),
  password: unsafe('j'),
}

it('Should update a user properly', async () => {
  return pipe(
    data,
    updateUser(registerOk),
    mapAll(result => expect(result).toBe(`Usuário ${data.username} atualizado com sucesso!`)),
  )()
})

it('Should not accept an update from a user with invalid username', async () => {
  return pipe(
    dataWithWrongUsername,
    updateUser(registerOk),
    mapAll(error => expect(error).toEqual(new Error('Invalid slug. Please, use alphanumeric characters, dash, underline and/or numbers.'))),
  )()
})

it('Should not accept an update from a user with invalid email and/or password', async () => {
  return pipe(
    dataWithWrongEmailAndPassword,
    updateUser(registerOk),
    mapAll(error => expect(error).toEqual(new Error('Invalid email:::Password should be at least 8 characters long.'))),
  )()
})

it('Should return a Left if update function throws an error', async () => {
  return pipe(
    data,
    updateUser(registerFail),
    mapAll(error => expect(error).toEqual(new Error('External error!'))),
  )()
})
