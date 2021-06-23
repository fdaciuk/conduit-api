# Node.js - Ports & Adapters boilerplate

Node.js, TypeScript, fp-ts

## NPM Scripts

- **yarn start**: Run production server
- **yarn dev**: Run dev server
- **yarn test**: Run unit and integration tests once (great to be used in CI)
- **yarn test:watch**: Run unit tests in watch mode
- **yarn test:integration**: Run integration tests once
- **yarn test:integration:watch**: Run integration tests in watch mode
- **yarn lint**: Run linter
- **yarn lint:fix**: Fix lint errors
- **yarn type-check**: TS typechecking
- **yarn prepare**: Not suposed to be manually used. It's just to configure husky.
- **yarn build**: Generates production build

## Important usage information

### Environment Variables

You can use env vars by creating a `.env` file on the root of the project.
To document all used env vars, and get autocomplete when use `process.env.YOU_VAR`,
just put all your env vars on file `environment.d.ts`.

### Global import

All files and dirs inside `src` directory can be imported using `@/`.
Prefer using this way over local import (`../../`).

## License

MIT
