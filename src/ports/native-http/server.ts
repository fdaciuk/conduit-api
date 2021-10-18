import { IncomingMessage, ServerResponse } from 'http'

export type RequestListener = (request: IncomingMessage, response: ServerResponse) => Promise<void>;
export type Routes = {
  [key: string]: RequestListener
}

export const DEFAULT_HEADER = { 'Content-Type': 'application/json' }

const routes: Routes = {
  '/not-found': async (_request, response) => {
    response.writeHead(404, DEFAULT_HEADER)
    response.write(JSON.stringify({ error: 'Route not found.' }))
    response.end()
  },
}

const errorHandler = (response: ServerResponse) => {
  return (error: unknown) => {
    console.error(error)
    response.writeHead(500, DEFAULT_HEADER)
    response.write(JSON.stringify({ error: 'Internal Server Error' }))
    response.end()
  }
}

export const app: RequestListener = (request, response) => {
  const { url, method } = request

  const [, apiPrefix, route] = url!.split('/')
  const key = `${method} /${apiPrefix}/${route}`

  response.writeHead(200, DEFAULT_HEADER)

  const routeHandler = routes[key] || routes['/not-found']
  return routeHandler!(request, response).catch(errorHandler(response))
}
