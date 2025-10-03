import * as zod from "zod"
import { validator } from "../validator"

const schema = zod.strictObject({
    problem: zod.string().max(255).optional(),
    description: zod.string().max(1000).optional(),
    difficulty: zod.enum(["Easy", "Medium", "Hard"]).optional(),
    task_definition: zod.string().max(255).optional(),
    duration_minutes: zod.number().min(10).max(720).optional(),
    score: zod.number().min(100).max(1000).optional(),
    hints: zod.array(zod.string().max(255)).optional(),
    categories: zod.array(zod.string().max(100)).optional()
})

const updateProblemValidator = new validator(schema)
export default updateProblemValidator