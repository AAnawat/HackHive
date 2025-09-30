import type CreateUser from "../use-cases/user/create";
import type ListUsers from "../use-cases/user/list";
import User from "../entities/user";
import type Authorize from "../use-cases/auth/authorize";
import type UpdateUser from "../use-cases/user/update";
import type GetUser from "../use-cases/user/get";
import type DeleteUser from "../use-cases/user/delete";
import type UserPasswordCheck from "../use-cases/auth/userPasswordCheck";

export default class UserController {
    private listUsers: ListUsers
    private createUser: CreateUser
    private updateUser: UpdateUser
    private authorize: Authorize
    private findUser: GetUser
    private deleteUser: DeleteUser
    private userPasswordCheck: UserPasswordCheck

    constructor(listUsers: ListUsers, createUser: CreateUser, updateUser: UpdateUser, authorize: Authorize, findUser: GetUser, deleteUser: DeleteUser, userPasswordCheck: UserPasswordCheck) {
        this.listUsers = listUsers
        this.createUser = createUser
        this.updateUser = updateUser
        this.authorize = authorize
        this.findUser = findUser
        this.deleteUser = deleteUser
        this.userPasswordCheck = userPasswordCheck
    }


    public async list(page: number, perPage: number): Promise<any> {
        try {

            const users = await this.listUsers.call(page, perPage)
            return users

        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
        }
    }

    public async find(id: number): Promise<User> {
        try {

            const user = await this.findUser.call(id)
            return user

        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
        }
    }

    public async create(payload: Partial<User>, password: string): Promise<User> {
        try {

            const createdUser = await this.createUser.call(payload, password)
            return createdUser

        } catch (error) {
            if (error instanceof Error) {
                if (error.cause.toString().includes("duplicate key value")) {
                    throw new Error("User already exists")
                } else {
                    console.error(error)
                    throw new Error("Can't create user")
                }
            }
        }
    }

    public async update(token: string, id: number, payload: Partial<User>, newPass: string, oldPass: string): Promise<Boolean> {
        try {

            if (!token) throw new Error("No token provided")
            const authorizedUser = await this.authorize.call(token)
            if (authorizedUser.id !== id) {
                throw new Error("Unauthorized")
            }

            let password: string = undefined
            if (newPass && oldPass) {
                const isMatch = await this.userPasswordCheck.call(id, oldPass)
                if (!isMatch) throw new Error("Old password is incorrect")
                password = newPass
            }

            const updatedUser = await this.updateUser.call(id, payload, password)
            return updatedUser

        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
        }
    }

    public async delete(token: string, id: number): Promise<void> {
        try {

            if (!token) throw new Error("No token provided")
            const authorizedUser = await this.authorize.call(token)
            if (authorizedUser.id !== id) {
                throw new Error("Unauthorized")
            }

            const deltedResult = await this.deleteUser.call(id)
            if (!deltedResult) throw new Error("User deleted failed")
            
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
        }
    }
}
