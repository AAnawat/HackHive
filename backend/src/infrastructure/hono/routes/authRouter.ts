import { Hono } from "hono";
import AuthController from "../../../controllers/authController";
import Login from "../../../use-cases/auth/login";
import serviceDAO from "../../../config/serviceDAO";
import encryptor from "../../utils/encryptor/encryptor";
import tokenManager from "../../utils/tokenManager/tokenManager";


const router = new Hono({ strict: false });
const controller = new AuthController(
    new Login(serviceDAO.user, encryptor, tokenManager)
)

router.post('/login', async (c) => {
    try {

        const body = await c.req.json();
        if (!(body.gmail && body.password)) {
            throw new Error("Missing required fields");
        }

        const token = await controller.login(body.gmail, body.password);
        return c.json({ token }, 200);
        
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: "Unknown error" }, 500);
    }
})

export default router;