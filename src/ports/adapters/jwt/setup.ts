import { createProvider } from '@/helpers/create-provider'

type Payload = { id: string }

type JwtModule = {
  createJWT: (payload: Payload, expirationTime?: string) => Promise<string>
  verifyJWT: (token: string) => Promise<{ payload: Payload }>
}

export const [setupJwt, jwt] = createProvider<JwtModule>({
  name: 'JWT',
  port: (jwtProvider) => import(`@/ports/jwt/${jwtProvider}`),
})
