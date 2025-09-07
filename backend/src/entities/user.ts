import Entity from "./entity";

export default class User extends Entity<User> {
    id!: number
    username!: string
    gmail!: string
    password?: string
    profile_path!: string
    gender!: "Male" | "Female"
}