import { Profile } from '@/core/types/profile'

export type Comment = {
  id: number
  createdAt: string
  updatedAt: string
  body: string
  author: Profile
}
