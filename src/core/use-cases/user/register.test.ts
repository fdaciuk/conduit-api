import { pipe } from 'fp-ts/function'
import { register, OutsideRegister } from './register'
import { CreateUser } from '@/core/types/user'
import {
  unsafeEmail,
  unsafePassword,
  unsafeSlug,
  mapAll,
} from '@/config/tests/fixtures'

const registerOk: OutsideRegister<string> = async (data) => {
  return `Usuário ${data.username} cadastrado com sucesso!`
}

const registerFail: OutsideRegister<never> = async () => {
  throw new Error('External error!')
}

const data: CreateUser = {
  username: unsafeSlug('john'),
  email: unsafeEmail('john@doe.com'),
  password: unsafePassword('jhon123!'),
}

const dataWithWrongUsername: CreateUser = {
  username: unsafeSlug('a'),
  email: unsafeEmail('john@doe.com'),
  password: unsafePassword('jhon123!'),
}

const dataWithWrongEmailAndPassword: CreateUser = {
  username: unsafeSlug('john-doe'),
  email: unsafeEmail('john'),
  password: unsafePassword('j'),
}

it('Should register a user properly', async () => {
  return pipe(
    data,
    register(registerOk),
    mapAll(result => expect(result).toBe(`Usuário ${data.username} cadastrado com sucesso!`)),
  )()
})

it('Should not accept a register from a user with invalid username', async () => {
  return pipe(
    dataWithWrongUsername,
    register(registerOk),
    mapAll(error => expect(error).toEqual(new Error('Invalid slug. Please, use alphanumeric characters, dash and/or numbers.'))),
  )()
})

it('Should not accept a register from a user with invalid email and/or password', async () => {
  return pipe(
    dataWithWrongEmailAndPassword,
    register(registerOk),
    mapAll(error => expect(error).toEqual(new Error('Invalid email:::Password should be at least 8 characters long.'))),
  )()
})

it('Should return a Left if register function throws an error', async () => {
  return pipe(
    data,
    register(registerFail),
    mapAll(error => expect(error).toEqual(new Error('External error!'))),
  )()
})
