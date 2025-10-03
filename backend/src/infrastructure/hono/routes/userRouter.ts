import { Hono } from "hono";
import UserController from "../../../controllers/userController";
import ListUsers from "../../../use-cases/user/list";
import serviceDAO from "../../../config/serviceDAO";
import encryptor from "../../utils/encryptor";
import createUserValidator from "../../validator/user/createUser";
import CreateUser from "../../../use-cases/user/create";
import UpdateUser from "../../../use-cases/user/update";
import Authorize from "../../../use-cases/auth/authorize";
import tokenManager from "../../utils/tokenManager";
import updateUserValidator from "../../validator/user/updateUser";
import GetUser from "../../../use-cases/user/get";
import DeleteUser from "../../../use-cases/user/delete";
import UserPasswordCheck from "../../../use-cases/auth/userPasswordCheck";
<<<<<<< HEAD
import PictureManager from "../../utils/pictureManager/pictureManager";
import s3Client from "../../s3";
import GetLeaderboard from "../../../use-cases/user/leaderboard";
=======
import PictureManager from "../../utils/pictureManager";
import s3Client from "../../aws/s3";
>>>>>>> 21aded95e0bf7deb4944f02d833e6f28b05c9216


const router = new Hono({ strict: false })
const controller = new UserController(
    new ListUsers(serviceDAO.user),
    new CreateUser(serviceDAO.user, createUserValidator, encryptor),
    new UpdateUser(serviceDAO.user, updateUserValidator, encryptor, new PictureManager(s3Client)),
    new Authorize(tokenManager),
    new GetUser(serviceDAO.user),
    new DeleteUser(serviceDAO.user, new PictureManager(s3Client)),
    new UserPasswordCheck(encryptor, serviceDAO.user)
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
        await controller.create(payload, body.password)
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

        const body = await c.req.parseBody()
        const payload: any = {}
        if (body.gmail) payload.gmail = body.gmail
        if (body.username) payload.username = body.username
        if (body.newPass || body.oldPass) {
            if (!(body.newPass && body.oldPass)) {
                throw new Error("Both old and new passwords are required to change password")
            } else {
                payload.newPass = body.newPass
                payload.oldPass = body.oldPass
            }
        }
        if (body.profile_pic) payload.profile_pic = body.profile_pic


        const updatedUser = await controller.update(token, id, payload, body.newPass as string, body.oldPass as string)
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

router.get('/leaderboard', async (c) => {
    try {
        const limit = c.req.query('limit') ? parseInt(c.req.query('limit')) : 50
        const getLeaderboard = new GetLeaderboard(serviceDAO.user)
        const leaderboard = await getLeaderboard.call(limit)
        return c.json(leaderboard, 200)
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400)
        }
        return c.json({ error: "Unknown error" }, 500)
    }
})

export default router