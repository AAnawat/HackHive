import type { ZodObject } from "zod";
import type { IValidationResult, IValidator } from "../../interfaces/validator";


export class validator implements IValidator {
    schema: ZodObject
    
    constructor(schema: ZodObject) {
        this.schema = schema
    }
    

    validate(body: any): IValidationResult<any> {
        const validationResult = this.schema.safeParse(body);       

        if (validationResult.success) {
            return {data: validationResult.data}
        } else {
            return {error: validationResult.error, data: validationResult.data}
        }
    }
}