import * as zod from 'zod'
import { validator } from '../validator'

const schema = zod.strictObject({
    username: zod.string().max(255).nonempty(),
    gmail: zod.email().max(255).nonempty(),
    password: zod.string().min(8).max(255).nonempty(),
})

const createUserValidator = new validator(schema)
export default createUserValidator