type DefaultErrorInput = {
  name: string
  code: number
  message: string
}

export class DefaultError extends Error {
  code: number

  constructor ({ name, code, message }: DefaultErrorInput) {
    super(message)
    this.name = name
    this.code = code
  }
}

export class AuthError extends DefaultError {
  constructor (message: string = 'Unauthorized') {
    super({ name: 'AuthError', code: 401, message })
  }
}

export class ForbiddenError extends DefaultError {
  constructor (message: string) {
    super({ name: 'ForbiddenError', code: 401, message })
  }
}

export class NotFoundError extends DefaultError {
  constructor (message: string) {
    super({ name: 'NotFoundError', code: 404, message })
  }
}

export class ValidationError extends DefaultError {
  constructor (message: string) {
    super({ name: 'ValidationError', code: 422, message })
  }
}
