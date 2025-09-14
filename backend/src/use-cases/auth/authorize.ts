import type User from "../../entities/user";
import type ITokenManager from "../../interfaces/tokenManager";


export default class Authorize {
    private tokenManager: ITokenManager

    constructor(tokenManager: ITokenManager) {
        this.tokenManager = tokenManager
    }


    async call(token: string): Promise<User> {
        try {
            const decoded = await this.tokenManager.verify(token)
            return decoded
        } catch (error) {
            throw new Error("Invalid token")
        }
    }

}
