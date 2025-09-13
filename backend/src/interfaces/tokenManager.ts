import type User from "../entities/user"

export default interface ITokenManager {
    generate(data: User): Promise<string>
    verify(token: string): Promise<User>
}