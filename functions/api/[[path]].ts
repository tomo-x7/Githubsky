import { Hono } from 'hono'

const app = new Hono()

app.get('/api/', (c) => {
  return c.text('Hello Hono!')
})

// export default app
export const onRequest:PagesFunction = (c)=>app.fetch(c.request)