import * as zod from 'zod'
import { validator } from '../validator'

const schema = zod.strictObject({
    username: zod.string().max(255).nonempty(),
    gmail: zod.email().max(255).nonempty(),
    password: zod.string().max(255).nonempty(),
    pfp_path: zod.string().max(255).optional()
})

const createUserValidator = new validator(schema)
export default createUserValidator