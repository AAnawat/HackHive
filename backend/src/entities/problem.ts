import Entity from "./entity"
import type Hint from "./hint"

export default class Problem extends Entity<Problem> {
    id!: number
    problem!: string
    description?: string
    like!: number
    dislike!: number
    difficulty!: "Easy" | "Medium" | "Hard"

    hints?: Hint[]
}