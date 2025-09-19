import { bigint, bigserial, boolean, pgTable } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { solvedRecordsTable } from "./solvedRecords";

export const usersLikeProblemsTable = pgTable("usersLikeProblems", {
    id: bigserial({mode: "number"}).primaryKey().notNull(),
    solve_id: bigint({mode: "number"}).notNull().references(() => solvedRecordsTable.id, {onDelete: "set null"}),
    is_like: boolean().notNull()
})

export const usersLikeProblemsRelations = relations(usersLikeProblemsTable, ({one}) => ({
    solvedRecordsTable: one(solvedRecordsTable, {
        fields: [usersLikeProblemsTable.solve_id],
        references: [solvedRecordsTable.id]
    }),
}))