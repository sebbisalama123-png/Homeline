import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/server/schema.ts',
  out: './db/pg-migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
})
