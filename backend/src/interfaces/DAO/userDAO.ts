import type User from "../../entities/user"

export default interface IUserDAO {
    find(filter: Partial<Omit<User, 'pfp_path'>>, page: number, perPage: number): Promise<User[]>
    findOne(filter: Partial<Omit<User, 'pfp_path'>>): Promise<User>
    create(payload: Partial<User>, password: string): Promise<User>
    update(id: number, payload: Partial<User>, password?: string): Promise<boolean>
    delete(id: number): Promise<boolean>
    findForAuth(filter: Partial<Omit<User, 'pfp_path'>>): Promise<User & { password: string }>
}