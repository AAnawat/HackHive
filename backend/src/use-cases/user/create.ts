import type IUserDAO from "../../interfaces/DAO/userDAO"
import User from "../../entities/user"
import type { IValidator } from "../../interfaces/validator"


export default class CreateUser {
    private userDAO: IUserDAO
    private validator: IValidator
    private encryptor: IEncryptor

    constructor(userDAO: IUserDAO, validator: IValidator, encryptor: IEncryptor) {
        this.userDAO = userDAO
        this.validator = validator
        this.encryptor = encryptor
    }

    
    public async call(payload: Partial<User>, password: string): Promise<User> {
        if (!(payload.gmail && payload.username && password)) {
            throw new Error("Missing required fields")
        }

        const validating: any = {
            username: payload.username,
            gmail: payload.gmail,
            password: password,
        }

        const validationResult = this.validator.validate(validating)
        if (validationResult.error) throw new Error(`Invalid input data: ${validationResult.error.message}`)

        const hashedPassword = await this.encryptor.hash(validationResult.data.password)

        const userToCreate = {
            ...validationResult.data,
            password: hashedPassword
        }
 
        const createdUserResult = await this.userDAO.create(userToCreate, userToCreate.password)
        return createdUserResult
    }
}