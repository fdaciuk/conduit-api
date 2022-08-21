import { Field, ObjectType } from 'type-graphql'

@ObjectType('User')
export class User {
  @Field()
  email: string

  @Field()
  username: string

  @Field({ nullable: true })
  token?: string

  @Field({ nullable: true })
  bio?: string

  @Field({ nullable: true })
  image?: string
}
