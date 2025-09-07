import { serve } from '@hono/node-server'
import { Hono } from 'hono'


const app = new Hono().basePath("/api")

app.get('/', async (c) => {
  return c.text('sorry nigger')
})


serve({
  fetch: app.fetch,
  port: 8080
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
