import { bigint, bigserial, pgTable, text } from "drizzle-orm/pg-core";
import { problemsTable } from "./problems";
import { relations } from "drizzle-orm";

export const hintsTable = pgTable("hints", {
    id: bigserial({mode: "number"}).primaryKey(),
    problem_id: bigint({mode: "number"}).notNull().references(() => problemsTable.id, {onDelete: 'cascade'}),
    hint: text().notNull()
})

export const hintsRelations = relations(hintsTable, ({one}) => ({
    problemsTable: one(problemsTable, {
        fields: [hintsTable.problem_id],
        references: [problemsTable.id]
    })
}))