import Entity from "./entity"

export default class Problem extends Entity<Problem> {
    id!: number
    problem!: string
    description?: string
    difficulty!: "Easy" | "Medium" | "Hard"
    score!: number
    
    like?: number

    hints?: string[]
    categories?: string[]
}