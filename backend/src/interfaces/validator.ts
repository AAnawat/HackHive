import type { ZodError } from "zod"

export interface IValidationResult<T> {
    error?: ZodError
    data: T
}

export interface IValidator {
    validate(body: any): IValidationResult<any>
}