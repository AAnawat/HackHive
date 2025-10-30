import { Hono } from "hono";
import SessionController from "../../../controllers/sessionController";
import serviceDAO from "../../../config/serviceDAO";
import StartSession from "../../../use-cases/session/startSession";
import Authorize from "../../../use-cases/auth/authorize";
import tokenManager from "../../utils/tokenManager";
import ContainerManager from "../../utils/containerManager";
import ecsClient from "../../aws/ecs";
import ec2Client from "../../aws/ec2";
import startSessionValidator from "../../validator/session/startSession";
import CloudQuery from "../../utils/cloudQuery";
import GetSession from "../../../use-cases/session/getSession";
import StopSession from "../../../use-cases/session/stopSession";
import SubmitFlag from "../../../use-cases/session/submitFlag";

const router = new Hono({ strict: false });
const controller = new SessionController(
    new StartSession(serviceDAO.session, serviceDAO.problem, new ContainerManager(ecsClient), new CloudQuery(ec2Client), startSessionValidator),
    new GetSession(serviceDAO.session),
    new StopSession(serviceDAO.session, new ContainerManager(ecsClient)),
    new SubmitFlag(serviceDAO.session, serviceDAO.solve, new ContainerManager(ecsClient)),
    new Authorize(tokenManager)
)

router.get('/', async (c) => {
    try {

        const token = c.req.header("Authorization")?.split(" ")[1];
        if (!token) throw new Error("Missing Authorization header");

        const session = await controller.get(token);
        return c.json({
            id: session.id,
            status: session.status,
            task_arn: session.task_arn,
            ip_address: session.ip_address,
            started_at: session.started_at,
            ended_at: session.ended_at,
        });
        
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400)
        }
        return c.json({ error: "Unknown error" }, 500)     
    }
});

router.get('/:id', async (c) => {
    try {

        const sessionId = parseInt(c.req.param("id"));

        const token = c.req.header("Authorization")?.split(" ")[1];
        if (!token) throw new Error("Missing Authorization header");

        const session = await controller.get(token, sessionId);
        return c.json({
            id: session.id,
            status: session.status,
            task_arn: session.task_arn,
            ip_address: session.ip_address,
            started_at: session.started_at,
            ended_at: session.ended_at,
        });
        
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400)
        }
        return c.json({ error: "Unknown error" }, 500)     
    }
});

router.post('/launch', async (c) => {
    try {

        const { userId, problemId } = await c.req.json();
        if (!userId || !problemId) throw new Error("Missing userId or problemId");

        const token = c.req.header("Authorization")?.split(" ")[1];
        if (!token) throw new Error("Missing Authorization header");

        const session = await controller.launch(token, userId, problemId);
        return c.json({
            id: session.id,
            status: session.status,
            task_arn: session.task_arn,
            ip_address: session.ip_address,
            started_at: session.started_at,
            ended_at: session.ended_at,
        });
        
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400)
        }
        return c.json({ error: "Unknown error" }, 500)
    }
});

router.delete('/:id/stop', async (c) => {
    try {

        const sessionId = parseInt(c.req.param("id"));
        if (isNaN(sessionId)) throw new Error("Invalid session ID");

        const token = c.req.header("Authorization")?.split(" ")[1];
        if (!token) throw new Error("Missing Authorization header");

        const result = await controller.stop(token, sessionId);
        return c.json({ success: result });
        
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400)
        }
        return c.json({ error: "Unknown error" }, 500)
    }
});

router.post('/:id/submit', async (c) => {
    try {

        const sessionId = parseInt(c.req.param("id"));
        if (isNaN(sessionId)) throw new Error("Invalid session ID");

        const { flag } = await c.req.json();
        if (!flag) throw new Error("Missing flag");

        const token = c.req.header("Authorization")?.split(" ")[1];
        if (!token) throw new Error("Missing Authorization header");

        const result = await controller.submit(token, sessionId, flag);
        return c.json(result);
        
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400)
        }
        return c.json({ error: "Unknown error" }, 500)
    }
});

export default router;
