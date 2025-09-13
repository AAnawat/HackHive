import type CreateUser from "../use-cases/user/create";
import type ListUsers from "../use-cases/user/list";
import User from "../entities/user";

export default class UserController {
    private listUsers: ListUsers
    private createUser: CreateUser

    constructor(listUsers: ListUsers, createUser: CreateUser) {
        this.listUsers = listUsers
        this.createUser = createUser
    }


    public async list(page: number, perPage: number): Promise<any> {
        try {

            const users = await this.listUsers.call(page, perPage)
            return users
            
        } catch (error) {
            
            console.error(error)
            throw new Error("Can't list users")

        }
    }

    public async create(payload: Partial<User>, password: string): Promise<User> {
        try {

            const createdUser = await this.createUser.call(payload, password)
            return createdUser

        } catch (error) {

            console.error(error)
            throw new Error("Can't create user")

        }
    }

}