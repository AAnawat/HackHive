import { Hono } from "hono";
import UserController from "../../../controllers/userController";
import ListUsers from "../../../use-cases/user/list";
import serviceDAO from "../../../config/serviceDAO";
import encryptor from "../../utils/encryptor/encryptor";
import createUserValidator from "../../validator/user/createUser";
import CreateUser from "../../../use-cases/user/create";


const router = new Hono({ strict: false })
const controller = new UserController(
    new ListUsers(serviceDAO.user),
    new CreateUser(serviceDAO.user, createUserValidator, encryptor)
)


router.get('/', async (c) => {

    try {

        const page = c.req.query('page') ? parseInt(c.req.query('page')) : 1
        const perPage = c.req.query('perPage') ? parseInt(c.req.query('perPage')) : 10
        const users = await controller.list(page, perPage)
        if (users.length > 0) return c.json(users)
        else return c.json({ message: "No users found" })

    } catch (error) {
        console.log(error)
        return c.json({ error: "Failed to process request" }, 500)
    }

})

router.post('/', async (c) => {
    try {

        const body = await c.req.json()
        if (!(body.gmail && body.username && body.password)) {
            throw new Error("Missing required fields")
        }

        const payload: any = {
            gmail: body.gmail,
            username: body.username,
        }
        if (body.pfp_path) payload.pfp_path = body.pfp_path
        const createdUser = await controller.create(payload, body.password)
        return c.json({ message: "User created successfully" }, 201)
        
    } catch (error: unknown) {
        console.log(error)
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400)
        }
        return c.json({ error: "Unknown error" }, 500)
    }
})

export default router