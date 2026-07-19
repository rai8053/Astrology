# Contributing

Thanks for contributing to Soma & Surya.

## Setup

1. Fork the repository and create a branch from `main`.
2. Install dependencies with `npm ci`, then `cd backend && npm ci` and `cd frontend && npm ci`.
3. Copy `.env.example` to `.env` and configure the required local services.
4. Start development with `npm run dev`.

## Pull requests

- Keep each pull request focused and describe the user-visible change.
- Run `npm run lint`, `npm test`, and `npm run build` before opening it.
- Add or update tests for behaviour changes.
- Do not commit secrets, generated build output, or local environment files.
- Ensure database changes include an appropriate Prisma migration.

By contributing, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
