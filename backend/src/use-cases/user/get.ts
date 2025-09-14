import type User from "../../entities/user";
import type IUserDAO from "../../interfaces/DAO/userDAO";

export default class GetUser {
    private userDAO: IUserDAO

    constructor(userDAO: IUserDAO) {
        this.userDAO = userDAO
    }


    async call(id: number): Promise<User> {
        const user = await this.userDAO.findOne({ id })
        if (!user) throw new Error("User not found")

        return user
    }
}