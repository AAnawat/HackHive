import Entity from "./entity";

export default class Hint extends Entity<Hint> {
    id!: number
    hint!: string
}