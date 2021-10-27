import { IncomingMessage, ServerResponse } from 'http'
import { getError } from '@/ports/adapters/http/http'
import { userRoutes, profileRoutes, articleRoutes } from './modules'

import { JWTPayload } from '@/ports/adapters/jwt'

export type IncomingRequest = IncomingMessage & {
  auth?: JWTPayload
  params?: { [key: string]: string}
  query?: { [key: string]: string}
}

export type RequestListener = (request: IncomingRequest, response: ServerResponse) => Promise<void>;
export type Routes = {
  [key: string]: RequestListener
}

export const DEFAULT_HEADER = { 'Content-Type': 'application/json' }

const routes: Routes & { '/not-found': RequestListener } = {
  ...userRoutes,
  ...profileRoutes,
  ...articleRoutes,
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
  const routeString = routes.map((route, i) => {
    const resource = routes[i - 1]

    if (resource === 'profiles') {
      const param = 'username'
      request.params![param] = route
      return `:${param}`
    }

    if (resource === 'articles' && route !== 'feed') {
      const param = 'slug'
      request.params![param] = route
      return `:${param}`
    }

    return route
  }).join('/')

  const hasQueryString = routeString.indexOf('?')
  const splitIndex = hasQueryString !== -1 ? hasQueryString : undefined
  return routeString.substring(0, splitIndex)
}

type ParseQuery = (url: string | undefined) => { [key: string]: string} | undefined
const parseQuery: ParseQuery = (url) => {
  if (!url) return

  const [, queryString] = url.split('?')
  if (!queryString) return

  const query = queryString.split('&').reduce((acc, query) => {
    const [key, value] = query.split('=')

    if (!key) return { ...acc }

    return {
      ...acc,
      [key]: value,
    }
  }, {})

  return query
}

export const app: RequestListener = (request, response) => {
  const { url, method } = request

  const [, apiPrefix, ...route] = url!.split('/')

  const pathWithQuery = route.find(el => el.includes('?'))
  request.query = parseQuery(pathWithQuery)
  request.params = {}

  const key = `${method} /${apiPrefix}/${mapRouteToResource(route, request)}`

  const routeHandler = routes[key] ?? routes['/not-found']
  return routeHandler(request, response).catch(errorHandler(response))
}
