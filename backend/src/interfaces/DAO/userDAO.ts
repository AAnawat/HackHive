import type User from "../../entities/user"

export default interface IUserDAO {
    find(filter: Partial<User>, page: number, perPage: number): Promise<User[]>
    findOne(filter: Partial<User>): Promise<User>
    create(payload: Partial<User>, password: string): Promise<User>
    update(id: number, payload: Partial<User>, password?: string): Promise<boolean>
    delete(id: number): Promise<boolean>
}