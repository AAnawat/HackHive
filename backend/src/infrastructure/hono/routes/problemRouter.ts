import { Hono } from "hono";
import ProblemController from "../../../controllers/problemController";
import GetAllProblems from "../../../use-cases/problem/getAll";
import serviceDAO from "../../../config/serviceDAO";
import GetProblem from "../../../use-cases/problem/get";
import CreateProblem from "../../../use-cases/problem/create";
import createProblemValidator from "../../validator/problem/createProblem";
import updateProblem from "../../../use-cases/problem/update";
import updateProblemValidator from "../../validator/problem/updateProblem";
import DeleteProblem from "../../../use-cases/problem/delete";
import AuthorizeAdmin from "../../../use-cases/auth/authorizeAdmin";
import Authorize from "../../../use-cases/auth/authorize";
import tokenManager from "../../utils/tokenManager";
import VoteProblem from "../../../use-cases/problem/vote";
import GetCategories from "../../../use-cases/problem/getCatagories";

const router = new Hono({ strict: false });
const controller = new ProblemController(
    new GetAllProblems(serviceDAO.problem, serviceDAO.user),
    new GetProblem(serviceDAO.problem),
    new CreateProblem(serviceDAO.problem, createProblemValidator),
    new updateProblem(serviceDAO.problem, updateProblemValidator),
    new DeleteProblem(serviceDAO.problem),
    new GetCategories(serviceDAO.problem),
    new VoteProblem(serviceDAO.solve),
    new AuthorizeAdmin(),
    new Authorize(tokenManager)
)

router.get("/", async (c) => {
    try {

        const page = c.req.query("page") ? parseInt(c.req.query("page")) : 1;
        const perPage = c.req.query("perPage") ? parseInt(c.req.query("perPage")) : 10;

        const filter: any = {};
        if (c.req.query("problem")) filter.problem = c.req.query("problem");
        if (c.req.query("difficulty")) filter.difficulty = c.req.query("difficulty");
        if (c.req.query("categories")) filter.categories = c.req.query("categories").split(",");
        
        let token: string;
        if (c.req.query("user")) {
            const userId = parseInt(c.req.query("user"));
            if (isNaN(userId)) throw new Error("Invalid user ID in filter");

            token = c.req.header("Authorization")?.split(" ")[1];
            if (!token) throw new Error("Missing Authorization header");

            filter.user = userId;
        }

        const problems = await controller.getAll(filter, page, perPage, token);
        return c.json(problems);
        
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400)
        }
        return c.json({ error: "Unknown error" }, 500)
    }
});

router.get("/:id", async (c) => {
    try {

        const filter = parseInt(c.req.param("id"));
        if (isNaN(filter)) throw new Error("Invalid problem ID");

        const problemResult = await controller.get(filter);
        return c.json(problemResult);

    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: "Unknown error" }, 500);
    }
});

router.post("/", async (c) => {
    try {

        let adminToken = c.req.header("Authorization");
        if (!adminToken) throw new Error("Missing Authorization header");
        else adminToken = adminToken.split(" ")[1] as string;

        const payload = await c.req.json();

        const createResult = await controller.create(adminToken, payload);
        if (createResult) return c.json({ message: "Problem created successfully" });
        else throw new Error("Problem not created");
        
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: "Unknown error" }, 500);
    }
})

router.put("/:id", async (c) => {
    try {

        const id = parseInt(c.req.param("id"));
        if (isNaN(id)) throw new Error("Invalid problem ID");

        let adminToken: string = c.req.header("Authorization");
        if (!adminToken) throw new Error("Missing Authorization header");
        else adminToken = adminToken.split(" ")[1] as string;

        const payload = await c.req.json();

        const updateResult = await controller.update(adminToken, id, payload);
        if (updateResult) return c.json({ message: "Problem updated successfully" });
        else throw new Error("Problem not updated");
        
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: "Unknown error" }, 500);
    }
});

router.delete("/:id", async (c) => {
    try {

        const id = parseInt(c.req.param("id"));
        if (isNaN(id)) throw new Error("Invalid problem ID");

        let adminToken = c.req.header("Authorization");
        if (!adminToken) throw new Error("Missing Authorization header");
        else adminToken = adminToken.split(" ")[1] as string;

        const deleteResult = await controller.delete(adminToken, id);
        if (deleteResult) return c.json({ message: "Problem deleted successfully" });
        else throw new Error("Problem not deleted");
        
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: "Unknown error" }, 500);
    }
});

router.post("/:id/vote", async (c) => {
    try {

        const problemId = parseInt(c.req.param("id"));
        if (isNaN(problemId)) throw new Error("Invalid problem ID");

        let token = c.req.header("Authorization");
        if (!token) throw new Error("Missing Authorization header");
        else token = token.split(" ")[1] as string;

        const body = await c.req.json();
        if (body.isLiked === undefined) throw new Error("Missing isLiked field");
        const isLiked = body.isLiked as boolean;

        const voteResult = await controller.vote(token, problemId, isLiked);
        if (voteResult) return c.json({ message: "Vote recorded successfully" });
        else throw new Error("Vote not recorded");
        
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: "Unknown error" }, 500);
    }
});

router.get("/categories/list", async (c) => {
    try {

        const categories = await controller.categories();
        return c.json(categories);
        
    } catch (error) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: "Unknown error" }, 500);
    }
})

export default router;