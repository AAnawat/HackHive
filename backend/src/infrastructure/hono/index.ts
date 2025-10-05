import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import userRouter from './routes/userRouter'
import authRouter from './routes/authRouter'
import problemRouter from './routes/problemRouter'
import sessionRouter from './routes/sessionRouter'


const app = new Hono({ strict: false }).basePath('/api')

app.get("/health", (c) => {
  return c.json({message: "Still Running."})
})

app.route("/users", userRouter)
app.route("/auth", authRouter)
app.route("/problems", problemRouter)
app.route("/sessions", sessionRouter)


serve({
  fetch: app.fetch,
  port: 8080
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
