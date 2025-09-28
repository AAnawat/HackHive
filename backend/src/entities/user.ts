import Entity from "./entity";

export default class User extends Entity<User> {
    id!: number
    username!: string
    gmail!: string
    pfp_path!: string
    score?: number
}