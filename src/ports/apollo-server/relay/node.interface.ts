import { Field, ID, InterfaceType } from 'type-graphql'

@InterfaceType('Node', { description: 'An object with a global ID.' })
export abstract class Node {
  @Field(_type => ID, {
    name: 'id',
    description: 'The global ID of the object.',
  })
  readonly globalId!: string
}
