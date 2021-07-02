import { outsideRegister } from '@/ports/db-in-memory/db'
import {
  OutsideRegisterType,
} from '@/adapters/use-cases/user/register-adapter'

export const userRegister: OutsideRegisterType = (data) => {
  return outsideRegister(data)
}
