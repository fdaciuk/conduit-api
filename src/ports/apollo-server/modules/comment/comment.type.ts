import { Field, ID, ObjectType } from 'type-graphql'
import { Profile } from '@/ports/apollo-server/modules/profile/profile.type'

@ObjectType('Comment')
export class Comment {
  @Field(_type => ID)
  id: number

  @Field()
  body: string

  @Field()
  createdAt: string

  @Field()
  updatedAt: string

  @Field(_type => Profile, { nullable: true })
  author?: Profile
}

@ObjectType('CommentDeleteResponse')
export class CommentDeleteResponse {
  @Field()
  success: boolean
}
