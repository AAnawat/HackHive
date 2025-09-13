import type User from "../../entities/user";
import type IUserDAO from "../../interfaces/DAO/userDAO";
import type { IValidator } from "../../interfaces/validator";


export default class UpdateUser {
    private userDAO: IUserDAO
    private validator: IValidator
    private encryptor: IEncryptor

    constructor(userDAO: IUserDAO, validator: IValidator, encryptor: IEncryptor) {
        this.userDAO = userDAO
        this.validator = validator
        this.encryptor = encryptor
    }


    async call(id: number, packet: Partial<User>, password: string): Promise<Boolean> {
        if (password) {
            var hashedPassword = await this.encryptor.hash(password)
        }
        const validating: any = {}
        if (packet.username) validating.username = packet.username
        if (packet.gmail) validating.gmail = packet.gmail
        if (password) validating.password = hashedPassword
        if (packet.pfp_path) validating.pfp_path = packet.pfp_path
        const validationResult = this.validator.validate(validating)
        if (validationResult.error) throw new Error("Invalid input data")

        const updateResult = await this.userDAO.update(id, validationResult.data, password ? validationResult.data.password : undefined)
        return !!updateResult
    }
}