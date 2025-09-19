import { eq, relations, sql } from "drizzle-orm";
import { bigserial, integer, pgEnum, pgTable, pgView, text, varchar } from "drizzle-orm/pg-core";
import { hintsTable } from "./hints";
import { problemsToCategoriesTable } from "./problemsToCategories";
import { solvedRecordsTable } from "./solvedRecords";
import { usersLikeProblemsTable } from "./usersLikeProblems";

export const difficultyEnum = pgEnum("difficulty", ["Easy", "Medium", "Hard"])

export const problemsTable = pgTable('problems', {
    id: bigserial({mode: "number"}).primaryKey(),
    problem: varchar({length: 255}).notNull().unique(),
    description: text(),
    difficulty: difficultyEnum().notNull(),
    score: integer().notNull().default(500),
})

export const problemsRelations = relations(problemsTable, ({many}) => ({
    hintsTable: many(hintsTable),
    problemsToCategoriesTable: many(problemsToCategoriesTable),
    solvedRecordsTable: many(solvedRecordsTable)
}))

export const problemsWithLikesView = pgView('problemsWithLikes').as((qb) => {
    return qb.select({
        id: problemsTable.id,
        problem: problemsTable.problem,
        description: problemsTable.description,
        difficulty: problemsTable.difficulty,
        score: problemsTable.score,
        likes: sql`COUNT(${usersLikeProblemsTable.is_like} = true OR NULL)::float / NULLIF(COUNT(${usersLikeProblemsTable.id}), 0) * 100`.as("likes")
    })
    .from(problemsTable)
    .leftJoin(solvedRecordsTable, eq(problemsTable.id, solvedRecordsTable.problem_id))
    .leftJoin(usersLikeProblemsTable, eq(solvedRecordsTable.id, usersLikeProblemsTable.solve_id))
    .groupBy(problemsTable.id)
})