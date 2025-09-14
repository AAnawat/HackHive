import Entity from "./entity"

export default class Problem extends Entity<Problem> {
    id!: number
    problem!: string
    description?: string
    like!: number
    dislike!: number
    difficulty!: "Easy" | "Medium" | "Hard"

    hints?: string[]
    categories?: string[]
    
}