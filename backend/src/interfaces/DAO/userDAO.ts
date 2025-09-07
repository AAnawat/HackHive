import type User from "../../entities/user"

export default interface IUserDAO {
    find(): User[] | Promise<User[]>
    findOne(): User | Promise<User>
    create(): boolean | Promise<boolean>
    update(): boolean | Promise<boolean>
    delete(): boolean | Promise<boolean>
}