import { Field, ObjectType } from 'type-graphql'

@ObjectType('Profile')
export class Profile {
  @Field()
  username: string

  @Field()
  bio: string

  @Field()
  image: string

  @Field()
  following: boolean
}
