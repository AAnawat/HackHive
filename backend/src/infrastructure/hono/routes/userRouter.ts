import { Hono } from "hono";
import UserController from "../../../controllers/userController";
import ListUsers from "../../../use-cases/user/list";
import serviceDAO from "../../../config/serviceDAO";
import encryptor from "../../utils/encryptor/encryptor";
import createUserValidator from "../../validator/user/createUser";
import CreateUser from "../../../use-cases/user/create";
import UpdateUser from "../../../use-cases/user/update";
import Authorize from "../../../use-cases/auth/authorize";
import tokenManager from "../../utils/tokenManager/tokenManager";
import updateUserValidator from "../../validator/user/updateUser";
import GetUser from "../../../use-cases/user/get";
import DeleteUser from "../../../use-cases/user/delete";


const router = new Hono({ strict: false })
const controller = new UserController(
    new ListUsers(serviceDAO.user),
    new CreateUser(serviceDAO.user, createUserValidator, encryptor),
    new UpdateUser(serviceDAO.user, updateUserValidator, encryptor),
    new Authorize(tokenManager),
    new GetUser(serviceDAO.user),
    new DeleteUser(serviceDAO.user)
)


router.get('/', async (c) => {

    try {

        const page = c.req.query('page') ? parseInt(c.req.query('page')) : 1
        const perPage = c.req.query('perPage') ? parseInt(c.req.query('perPage')) : 10
        const users = await controller.list(page, perPage)
        if (users.length > 0) return c.json(users)
        else return c.json({ message: "No users found" })

    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400)
        }
        return c.json({ error: "Unknown error" }, 500)
    }

})

router.get('/:id', async (c) => {
    try {

        const id = parseInt(c.req.param('id'))

        const user = await controller.find(id)
        if (!user) return c.json({ message: "User not found" }, 404)
        return c.json(user)

    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400)
        }
        return c.json({ error: "Unknown error" }, 500)
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
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400)
        }
        return c.json({ error: "Unknown error" }, 500)
    }
})

router.put('/:id', async (c) => {
    try {

        const id = parseInt(c.req.param('id'))

        const token = c.req.header('Authorization').split(' ')[1]
        if (!token) throw new Error("No token provided")

        const body = await c.req.json()
        const payload: any = {}
        if (body.gmail) payload.gmail = body.gmail
        if (body.username) payload.username = body.username
        if (body.pfp_path) payload.pfp_path = body.pfp_path

        const updatedUser = await controller.update(token, id, payload, body.password)
        if (!updatedUser) throw new Error("User not updated")

        return c.json({ message: "User updated successfully" }, 200)
        
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400)
        }
        return c.json({ error: "Unknown error" }, 500)
    }
})

router.delete('/:id', async (c) => {
    try {
        const id = parseInt(c.req.param('id'))
        const token = c.req.header('Authorization').split(' ')[1]
        if (!token) throw new Error("No token provided")

        await controller.delete(token, id)
        return c.json({ message: "User deleted successfully" }, 200)

    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400)
        }
        return c.json({ error: "Unknown error" }, 500)
    }
})


export default router