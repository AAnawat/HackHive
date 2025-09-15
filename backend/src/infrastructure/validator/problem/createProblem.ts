import * as zod from "zod"
import { validator } from "../validator"

const schema = zod.strictObject({
    problem: zod.string().max(255).nonempty(),
    description: zod.string().max(1000).optional(),
    like: zod.number().min(0).optional(),
    dislike: zod.number().min(0).optional(),
    difficulty: zod.enum(["Easy", "Medium", "Hard"]),
    hints: zod.array(zod.string().max(255)).optional(),
    categories: zod.array(zod.string().max(100)).optional()
})

const createProblemValidator = new validator(schema)
export default createProblemValidator