import {
  OutsideRegisterType,
} from '@/adapters/use-cases/user/register-user-adapter'

export const outsideRegister: OutsideRegisterType = async (data) => {
  return {
    user: {
      email: data.email,
      token: '',
      username: data.username,
      bio: '',
      image: undefined,
    },
  }
}
