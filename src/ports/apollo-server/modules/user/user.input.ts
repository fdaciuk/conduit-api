import { Field, InputType } from 'type-graphql'

@InputType()
export class CreateUserInput {
  @Field()
  username: string

  @Field()
  email: string

  @Field()
  password: string
}

@InputType()
export class LoginInput {
  @Field()
  email: string

  @Field()
  password: string
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  email?: string

  @Field({ nullable: true })
  username?: string

  @Field({ nullable: true })
  bio?: string

  @Field({ nullable: true })
  password?: string

  @Field({ nullable: true })
  image?: string
}
