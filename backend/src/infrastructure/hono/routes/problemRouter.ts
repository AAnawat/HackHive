import { Hono } from "hono";
import ProblemController from "../../../controllers/problemController";
import GetAllProblems from "../../../use-cases/problem/getAll";
import serviceDAO from "../../../config/serviceDAO";

const router = new Hono({ strict: false });
const controller = new ProblemController(
    new GetAllProblems(serviceDAO.problem)
)

router.get("/", async (c) => {
    try {

        const page = c.req.query("page") ? parseInt(c.req.query("page")) : 1;
        const perPage = c.req.query("perPage") ? parseInt(c.req.query("perPage")) : 10;

        const filter: any = {};
        if (c.req.query("problem")) filter.problem = c.req.query("problem");
        if (c.req.query("difficulty")) filter.difficulty = c.req.query("difficulty");
        if (c.req.query("categories")) filter.categories = c.req.query("categories").split(",");
        console.log(filter);

        const problems = await controller.getAll(filter, page, perPage);
        return c.json(problems);
        
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400)
        }
        return c.json({ error: "Unknown error" }, 500)
    }
});

export default router;