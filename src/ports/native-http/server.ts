import { IncomingMessage, ServerResponse } from 'http'
import { getError } from '@/ports/adapters/http/http'
import { userRoutes, profileRoutes } from './modules'

import { JWTPayload } from '@/ports/adapters/jwt'

export type IncomingRequest = IncomingMessage & {
  auth?: JWTPayload
  params?: { [key: string]: string}
}

export type RequestListener = (request: IncomingRequest, response: ServerResponse) => Promise<void>;
export type Routes = {
  [key: string]: RequestListener
}

export const DEFAULT_HEADER = { 'Content-Type': 'application/json' }

const routes: Routes & { '/not-found': RequestListener } = {
  ...userRoutes,
  ...profileRoutes,
  '/not-found': async (_request, response) => {
    response.writeHead(404, DEFAULT_HEADER)
    response.write(JSON.stringify({ error: 'Route not found.' }))
    response.end()
  },
}

type ErrorHandler = (response: ServerResponse) => (error: Error) => void
const errorHandler: ErrorHandler = (response) => {
  return (error) => {
    console.error(error)
    response.writeHead(500, DEFAULT_HEADER)
    response.write(JSON.stringify(getError(error)))
    return response.end()
  }
}

type HttpResponse = (response: ServerResponse, data: Record<string, any>, status?: number) => void
export const httpResponse: HttpResponse = (response, data, status = 200) => {
  response.writeHead(status, DEFAULT_HEADER)
  response.write(JSON.stringify(data))
  return response.end()
}

type MapRouteToResource = (routes: string[], request: IncomingRequest) => string
const mapRouteToResource: MapRouteToResource = (routes, request) => {
  return routes.map((route, i) => {
    if (routes[i - 1] === 'profiles') {
      const param = 'username'
      request.params![param] = route
      return `:${param}`
    }

    return route
  }).join('/')
}

export const app: RequestListener = (request, response) => {
  const { url, method } = request
  request.params = {}

  const [, apiPrefix, ...route] = url!.split('/')
  const key = `${method} /${apiPrefix}/${mapRouteToResource(route, request)}`

  const routeHandler = routes[key] ?? routes['/not-found']
  return routeHandler(request, response).catch(errorHandler(response))
}
