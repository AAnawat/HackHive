import type User from "../../entities/user";
import type IUserDAO from "../../interfaces/DAO/userDAO";

export default class ListUsers {
    userDAO: IUserDAO

    constructor(userDAO: IUserDAO) {
        this.userDAO = userDAO
    }


    async call(page: number = 1, perPage: number = 10): Promise<User[]> {
        return this.userDAO.find({}, page, perPage)
    }

}