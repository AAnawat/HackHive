import { bigint, bigserial, integer, pgTable, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { problemsTable } from "./problems";
import { relations } from "drizzle-orm";
import { usersLikeProblemsTable } from "./usersLikeProblems";

export const solvedRecordsTable = pgTable("solvedRecords", {
    id: bigserial({mode: "number"}).primaryKey().notNull(),
    user_id: bigint({mode: "number"}).notNull().references(() => usersTable.id, {onDelete: "cascade"}),
    problem_id: bigint({mode: "number"}).notNull().references(() => problemsTable.id, {onDelete: "set null"}),
    solve_score: integer().notNull(),
}, (t) => [
    uniqueIndex('solved_user_problem_idx').on(t.user_id, t.problem_id)
])

export const solvedRecordsRelations = relations(solvedRecordsTable, ({one}) => ({
    usersTable: one(usersTable, {
        fields: [solvedRecordsTable.user_id],
        references: [usersTable.id]
    }),
    problemsTable: one(problemsTable, {
        fields: [solvedRecordsTable.problem_id],
        references: [problemsTable.id]
    }),
    usersLikeProblemsTable: one(usersLikeProblemsTable)
}))