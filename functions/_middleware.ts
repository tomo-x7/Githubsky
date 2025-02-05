import { Hono } from 'hono'

const app = new Hono()

app.get('/api/', (c) => {
  return c.text('Hello Hono!')
})

// export default app
export const onRequest = app.fetch