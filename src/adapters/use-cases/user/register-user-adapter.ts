import * as user from '@/core/use-cases/user/register-user'
import { UserOutput } from '@/core/types/user'

export type OutsideRegisterUser = user.OutsideRegisterUser<{
  user: UserOutput
}>

export const registerUser: user.RegisterUser = (outsideRegister) => (data) =>
  user.registerUser(outsideRegister)(data)
