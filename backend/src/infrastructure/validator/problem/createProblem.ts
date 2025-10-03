import * as zod from "zod"
import { validator } from "../validator"

const schema = zod.strictObject({
    problem: zod.string().max(255).nonempty(),
    description: zod.string().max(1000).optional(),
    difficulty: zod.enum(["Easy", "Medium", "Hard"]),
    task_definition: zod.string().max(255).nonempty(),
    duration_minutes: zod.number().min(10).max(720),
    score: zod.number().min(100).max(1000).optional(),
    hints: zod.array(zod.string().max(255)).optional(),
    categories: zod.array(zod.string().max(100)).optional()
})

const createProblemValidator = new validator(schema)
export default createProblemValidator