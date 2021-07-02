import {
  register as registerCore,
  Register,
  OutsideRegister,
} from '@/core/use-cases/user/register'
import { CreateUser } from '@/core/types/user'

export type OutsideRegisterType = OutsideRegister<{
  success: boolean,
  data: CreateUser
}>

export const register: Register = (outsideRegister) => (data) =>
  registerCore(outsideRegister)(data)
