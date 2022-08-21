import { ApolloError } from 'apollo-server'
import { getError } from '@/ports/adapters/http/http'

const errors: Record<number, { code: string, name: string }> = {
  401: {
    code: 'UNAUTHORIZED',
    name: 'AuthError',
  },
  403: {
    code: 'FORBIDDEN',
    name: 'ForbiddenError',
  },
  404: {
    code: 'NOT_FOUND',
    name: 'NotFoundError',
  },
  422: {
    code: 'VALIDATION_ERROR',
    name: 'ValidationError',
  },
  418: {
    code: 'UnknownError',
    name: 'UNKNOWN_ERROR',
  },
}

export class GraphQLError extends ApolloError {
  constructor (errorObject: ReturnType<typeof getError>) {
    const message = errorObject.error.errors.body.join(':::')
    const errorData = errors[errorObject.code]
    const code = errorData?.code ?? 'GRAPHQL_ERROR'
    const name = errorData?.name ?? 'GraphQLError'
    super(message, code)
    Object.defineProperty(this, 'name', { value: name })
  }
}
