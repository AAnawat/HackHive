import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import provider from '../../config/cloudProvider'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import userRouter from './routes/userRouter'
import authRouter from './routes/authRouter'
import problemRouter from './routes/problemRouter'
import sessionRouter from './routes/sessionRouter'
import leaderboardRoute from './routes/userRouter'


const app = new Hono({ strict: false }).basePath('/api')

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['X-Response-Time'],
    maxAge: 600,
    credentials: true,
  })
)

app.get("/health", (c) => {
  return c.json({message: "Still Running."})
})

// Profile pictures stored on disk when CLOUD_PROVIDER=local
if (provider === "local") {
  app.use("/uploads/*", serveStatic({
    root: "./",
    rewriteRequestPath: (path) => path.replace(/^\/api/, ""),
  }))
}

app.route("/users", userRouter)
app.route("/auth", authRouter)
app.route("/problems", problemRouter)
app.route("/sessions", sessionRouter)
app.route("/leaderboard", leaderboardRoute)

serve({
  fetch: app.fetch,
  port: 8080
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
