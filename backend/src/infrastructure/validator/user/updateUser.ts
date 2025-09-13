import * as zod from 'zod'
import { validator } from '../validator'

const schema = zod.strictObject({
    username: zod.string().max(255).optional(),
    gmail: zod.email().max(255).optional(),
    password: zod.string().max(255).optional(),
    pfp_path: zod.string().max(255).optional()
})

const updateUserValidator = new validator(schema)
export default updateUserValidator