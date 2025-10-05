import * as zod from 'zod'
import { validator } from '../validator'

const schema = zod.strictObject({
    userId: zod.number().int().positive(),
    problemId: zod.number().int().positive(),
    flag: zod.string().max(255).nonempty()
})

const startSessionValidator = new validator(schema)
export default startSessionValidator