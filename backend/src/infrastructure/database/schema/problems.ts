import { relations } from "drizzle-orm";
import { bigint, bigserial, pgEnum, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { hintsTable } from "./hints";
import { problemsToCategoriesTable } from "./problemsToCategories";

export const difficultyEnum = pgEnum("difficulty", ["Easy", "Medium", "Hard"])

export const problemsTable = pgTable('problems', {
    id: bigserial({mode: "number"}).primaryKey(),
    problem: varchar({length: 255}).notNull().unique(),
    description: text(),
    like: bigint({mode: "number"}).notNull().default(0),
    dislike: bigint({mode: "number"}).notNull().default(0),
    difficulty: difficultyEnum().notNull()
})

export const problemsRelations = relations(problemsTable, ({many}) => ({
    hintsTable: many(hintsTable),
    problemsToCategoriesTable: many(problemsToCategoriesTable)
}))